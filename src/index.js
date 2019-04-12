export default function (babel) {
  const { types: t } = babel;

  const PARAMS_LENGTH_DISCRIMINANTS_MISMATCH = 'PARAMS_LENGTH_DISCRIMINANTS_MISMATCH'
  const IGNORE_CONSTANT = '_';
  
  // Compiles the execution consequent from the switch statement into an if-else block body.
  // Removes break statements and adds all fallthrough consequents.
  // Note to future self: there may be a way to avoid duplication here...
  function compileConsequents(cases) {
    const consequents = cases.map(c => c.consequent);
    let consequentUpTo = 1
    for (const consequent of consequents) {
      if (t.isBreakStatement(consequent[consequent.length - 1])) {
        break;
      }
      consequentUpTo += 1;
    }
    return consequents
      .slice(0, consequentUpTo)
      .reduce((all, consequent) => {
        if (t.isBreakStatement(consequent[consequent.length - 1])) {
          return all.concat(consequent.slice(0, consequent.length - 1))
        } else {
          return all.concat(consequent)
        }
      }, []);
  }

  function applyDiscriminantsToTestExpression(expression, discriminants) {
    if (discriminants.length < 1) {
      const err = new Error('More parameters to apply than discriminants available!')
      err.code = PARAMS_LENGTH_DISCRIMINANTS_MISMATCH
      throw err;
    }

    // TODO: Optimize this away so that it doesn't even show up in the test expression.
    if (t.isIdentifier(expression) && IGNORE_CONSTANT === expression.name) {
      return {
        remainingDiscriminants: discriminants.slice(1),
        expression: t.booleanLiteral(true),
      }
    }

    if (t.isArrowFunctionExpression(expression) || t.isFunctionExpression(expression)) {
      if (expression.params.length > discriminants.length) {
        const err = new Error('More parameters to apply than discriminants available!')
        err.code = PARAMS_LENGTH_DISCRIMINANTS_MISMATCH
        throw err;
      }

      const toApply = discriminants.slice(0, expression.params.length)
      const remainingDiscriminants = discriminants.slice(expression.params.length)
      return {
        remainingDiscriminants,
        expression: t.callExpression(expression, toApply),
      }
    } else if (t.isLiteral(expression) || t.isIdentifier(expression)) {
      const toApply = discriminants[0]
      const remainingDiscriminants = discriminants.slice(1)
      return {
        remainingDiscriminants,
        expression: t.binaryExpression('===', toApply, expression),
      }
    } else {
      throw new Error('Unrecognized case expression type: ' + expression.type)
    }
  }

  function sequenceFnToTest(exprs, discriminants) {
    if (exprs.length < 2) {
      const expr = exprs[0]
      const { expression } = applyDiscriminantsToTestExpression(expr, discriminants)
      return expression;

    } else {
      const expr = exprs[0]
      const { remainingDiscriminants, expression } = applyDiscriminantsToTestExpression(expr, discriminants)
      return t.logicalExpression(
        '&&',
        expression,
        sequenceFnToTest(exprs.slice(1), remainingDiscriminants)
      )
    }
  }

  function switchCaseToLogicalExpr(switchCase, discriminants) {
    try {
      if (t.isSequenceExpression(switchCase.test)) {
        return sequenceFnToTest(switchCase.test.expressions, discriminants)
      } else {
        return sequenceFnToTest([switchCase.test], discriminants)
      }
    } catch (err) {
      if (PARAMS_LENGTH_DISCRIMINANTS_MISMATCH !== err.code) {
        throw err
      }
      const testExprs = switchCase.test.expressions || [switchCase.test]
      const stringifiedExprs = testExprs
        .map((expr) => {
          // Is there an easier, babel-native way to stringify the switch case?
          if (t.isLiteral(expr)) {
            return JSON.stringify(expr.value)
          }
          if (t.isIdentifier(expr)) {
            return expr.name
          }
          if (expr.params) {
            if (t.isFunctionExpression(expr)) {
              return 'function ' + expr.id.name + '(' + expr.params.map(p => p.name || p.left && p.left.name).join(',') + ') {...}'
            } else {
              // Arrow function 
              return '(' + expr.params.map(p => p.name || p.left && p.left.name).join(',') + ') => ...'
            }
          }
          return '<Unrecognized type: ' + expr.type + '>'
        })
      throw new Error(err.message + ': At branch \'case ' + stringifiedExprs.join(',') + ':\'')
    }
  }

  function convertSwitchToIfElse(cases, discriminantIdentifiers) {
    const switchCase = cases[0]
    if (cases.length < 2) {
      if (!switchCase.test) {
        return t.blockStatement(compileConsequents(cases))
      }
      return t.ifStatement( 
        switchCaseToLogicalExpr(switchCase, discriminantIdentifiers),
        t.blockStatement(compileConsequents(cases))
      )
    } else {
      return t.ifStatement(
        switchCaseToLogicalExpr(switchCase, discriminantIdentifiers),
        t.blockStatement(compileConsequents(cases)),
        convertSwitchToIfElse(cases.slice(1), discriminantIdentifiers)
      )
    }
  }

  return {
    name: "ast-transform", // not required
    visitor: {
      SwitchStatement(path) {
        // TODO: Make sure that the discriminant identifiers never interfere with
        //       variables in the surrounding scope!
        const destructurePrefix = 'discriminant';

        if (t.isSequenceExpression(path.node.discriminant)) {
          const discriminantIdentifiers = path.node.discriminant.expressions.map((_, i) => t.identifier(destructurePrefix + i))
          const discriminantVariableDeclarators = path.node.discriminant.expressions.map((expr, i) =>
            t.variableDeclarator(t.identifier(destructurePrefix + i), expr))
          const destructuredDiscriminantDeclaration = t.variableDeclaration('const', discriminantVariableDeclarators)
          const ifelseBlock = convertSwitchToIfElse(path.node.cases, [].concat(discriminantIdentifiers))

          path.replaceWith(t.blockStatement([
            destructuredDiscriminantDeclaration,
            ifelseBlock,
          ]))

        } else {
          const discriminants = [path.node.discriminant]
          const discriminantIdentifiers = discriminants.map((_, i) => t.identifier(destructurePrefix + i))
          const discriminantVariableDeclarators = discriminants.map((expr, i) =>
            t.variableDeclarator(t.identifier(destructurePrefix + i), expr))
          const destructuredDiscriminantDeclaration = t.variableDeclaration('const', discriminantVariableDeclarators)
          const ifelseBlock = convertSwitchToIfElse(path.node.cases, [].concat(discriminantIdentifiers))

          path.replaceWith(t.blockStatement([
            destructuredDiscriminantDeclaration,
            ifelseBlock,
          ]))
        }
      }
    }
  };
}

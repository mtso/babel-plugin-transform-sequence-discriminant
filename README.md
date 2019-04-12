# babel-plugin-transform-sequence-discriminants

Transforms switch cases into pattern-matching if-else statements.

## Example

```js
const outsideVariable = 'foo';

switch ('foo', 'bar') {
  case 'foo', 'boo':
    console.log('not a match');
    break;
  case outsideVariable, 'bar':
    console.log('match!');
    break;
  case (x, y) => 'foobar' === x + y:
    console.log('match!');
    break;
  case (x) => 'FOO' === x.toUpperCase(), 'bar':
    console.log('match!');
    break;
  case 'foo', _:
    console.log('match!');
    break;
  case _, _:
    console.log('match!');
    break;
  default:
    console.log('match!');
    break;
}
```

Output:

```js
const outsideVariable = 'foo';

{
  const discriminant0 = 'foo',
        discriminant1 = 'bar';

  if (discriminant0 === 'foo' && discriminant1 === 'boo') {
    console.log('not a match');
  } else if (discriminant0 === outsideVariable && discriminant1 === 'bar') {
    console.log('match!');
  } else if (((x, y) => 'foobar' === x + y)(discriminant0, discriminant1)) {
    console.log('match!');
  } else if ((x => 'FOO' === x.toUpperCase())(discriminant0) && discriminant1 === 'bar') {
    console.log('match!');
  } else if (discriminant0 === 'foo' && true) {
    console.log('match!');
  } else if (true && true) {
    console.log('match!');
  } else {
    console.log('match!');
  }
}
```

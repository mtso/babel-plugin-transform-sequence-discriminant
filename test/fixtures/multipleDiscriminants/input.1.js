const a = 'foo';
const b = 'bar';

// For capturing from eval().
let returnString = '';

switch (a, b) {
  case 'foo', 'baz':
    returnString += 'foo-baz';
    break;
  case 'foo', 'bar':
    returnString += 'foo-bar';
    break;
  default:
    returnString += 'default';
}

switch (a, b) {
  case 'foo', 'baz':
    returnString += 'foo-baz';
    break;
  case 'foo', 'bar':
    returnString += 'foo-bar-fallthrough';
  default:
    returnString += 'default';
}

switch (a, b) {
  case 'foo', 'baz':
    returnString += 'foo-baz';
    break;
  case (x, y) => x !== y:
    returnString += 'x!==y';
    break;
  case 'foo', 'bar':
    returnString += 'foo-bar';
    break;
  default:
    returnString += 'default';
}

switch (a, b) {
  case 'foo', 'baz':
    returnString += 'foo-baz';
    break;
  case a, b:
    returnString += 'a-b';
    break;
  case (x, y) => x !== y:
    returnString += 'x!==y';
    break;
  case 'foo', 'bar':
    returnString += 'foo-bar';
    break;
  default:
    returnString += 'default';
}

switch (a, b) {
  case 'foo', 'baz':
    returnString += 'foo-baz';
    break;
  case 'foo', _:
    returnString += 'foo-_';
    break;
  case (x, y) => x !== y:
    returnString += 'x!==y';
    break;
  case 'foo', 'bar':
    returnString += 'foo-bar';
    break;
  default:
    returnString += 'default';
}

return returnString;

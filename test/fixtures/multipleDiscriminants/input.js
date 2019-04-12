const a = 'foo';
const b = 'bar';

switch (a, b) {
  case 'foo', 'baz':
    console.log('foo-baz');
    break;
  case 'foo', 'bar':
    console.log('foo-bar');
    break;
  default:
    console.log('default');
}

switch (a, b) {
  case 'foo', 'baz':
    console.log('foo-baz');
    break;
  case 'foo', 'bar':
    console.log('foo-bar-fallthrough');
  default:
    console.log('default');
}

switch (a, b) {
  case 'foo', 'baz':
    console.log('foo-baz');
    break;
  case (x, y) => x !== y:
    console.log('x!==y');
    break;
  case 'foo', 'bar':
    console.log('foo-bar');
    break;
  default:
    console.log('default');
}

switch (a, b) {
  case 'foo', 'baz':
    console.log('foo-baz');
    break;
  case a, b:
    console.log('a-b');
    break;
  case (x, y) => x !== y:
    console.log('x!==y');
    break;
  case 'foo', 'bar':
    console.log('foo-bar');
    break;
  default:
    console.log('default');
}

switch (a, b) {
  case 'foo', 'baz':
    console.log('foo-baz');
    break;
  case 'foo', _:
    console.log('foo-_');
    break;
  case (x, y) => x !== y:
    console.log('x!==y');
    break;
  case 'foo', 'bar':
    console.log('foo-bar');
    break;
  default:
    console.log('default');
}

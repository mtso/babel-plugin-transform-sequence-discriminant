switch ('off', 'on') {
  case 'off', 'off':
    console.log('all off')
    break;
  case 'on', 'on':
    console.log('all on')
    break;
  case a, b:
    console.log('hi')
    break;
  case (x, y) => x !== y:
  case function abc(x, y, z) { return x === y }, 'foo', abcd:
  default:
    console.log('one off, one on');
    break;
}

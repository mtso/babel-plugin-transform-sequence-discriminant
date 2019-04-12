const path = require('path');
const babel = require('babel-core');

const babelOptions = {
  babelrc: false,
  plugins: [
    path.resolve('./lib/index.js'),
  ],
};

babel.transformFile(__dirname + '/input.js', babelOptions, (err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(result.code)
})

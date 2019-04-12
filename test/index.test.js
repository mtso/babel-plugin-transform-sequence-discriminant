import fs from 'fs';
import path from 'path';
import { transformFile } from 'babel-core';

describe('babel-plugin-transform-sequence-discriminant', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const babelOptions = {
    babelrc: false,
    plugins: [
      'syntax-jsx',
      path.resolve('./lib/index.js'),
    ],
  };

  fs.readdirSync(fixturesDir).forEach((caseName) => {
    test(caseName, (done) => {
      const fixtureDir = path.join(fixturesDir, caseName);
      const actualPath = path.join(fixtureDir, 'actual.jsx');
      const io = [
        new Promise((resolve, reject) => transformFile(actualPath, babelOptions, (err, result) => {
          if (err) return reject(err);
          resolve(result.code && result.code.trim());
        })),
        new Promise((resolve, reject) => fs.readFile(path.join(fixtureDir, 'expected.jsx'), (err, expected) => {
          if (err) return reject(err);
          resolve(expected.toString());
        })),
      ];

      Promise.all(io).then(([ actual, expected ]) => {
        expect(actual).toEqual(expected);
        done();
      });
    })
  });
});

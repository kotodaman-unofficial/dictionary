import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/finder.js',
    format: 'umd',
    name: 'kotodamanFinder'
  },
  plugins: [
    commonjs({
      include: 'node_modules/**'
    }),
    resolve(),
    json(),
  ]
};
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/finder.min.js',
    format: 'umd',
    name: 'kotodamanFinder',
    sourcemap: true,
    sourcemapFile: 'dist/finder.min.js.map'
  },
  plugins: [
    commonjs({
      include: 'node_modules/**'
    }),
    resolve(),
    json(),
    terser(),
  ]
};
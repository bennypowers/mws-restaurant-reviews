import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  plugins: [
    resolve(),
    uglify(),
  ],
  input: 'js/date-fns.js',
  output: {
    file: 'js/date-fns.min.js',
    format: 'es',
  }
};

import uglify from 'rollup-plugin-uglify';

export default {
  plugins: [
    uglify(),
  ],
  input: 'js/main.js',
  output: {
    file: 'main.min.js',
    format: 'es',
  }
};

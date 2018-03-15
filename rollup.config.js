import uglify from 'rollup-plugin-uglify';

export default {
  plugins: [
    uglify(),
  ],
  input: 'js/restaurant-reviews.js',
  output: {
    file: 'js/restaurant-reviews.min.js',
    format: 'es',
  }
};

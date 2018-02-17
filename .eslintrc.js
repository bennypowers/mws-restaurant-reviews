module.exports = {
  extends: "eslint:recommended",
  plugins: ['html'],
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    semi: [2, 'always'],
  },
  globals: {
    google: true,
    restaurant: true,
    map: true,
    restaurants: true,
    neighborhoods: true,
    cuisines: true,
    map: true,
    markers: true,
  }
};

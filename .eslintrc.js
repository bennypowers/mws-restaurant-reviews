module.exports = {
  parser: 'babel-eslint',
  extends: 'eslint:recommended',
  plugins: [
    'html',
    'no-loops'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    semi: [2, 'always'],
    'no-loops/no-loops': 2,
  },
  overrides: {
    files: ['service-worker.js'],
    env: {
      serviceworker: true,
    },
  },
};

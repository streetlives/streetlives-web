module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',

  env: {
    node: true,
    jest: true,
    browser: true,
    es6: true,
  },

  rules: {
    'max-len': [2, 100],
    'no-console': 2,
    'no-multiple-empty-lines': [2, { max: 1, maxBOF: 1, maxEOF: 1 }],
    'no-unused-vars': [2, { args: 'none' }],
    'react/prop-types': 0,
    'react/require-default-props': 0,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],
  },
};

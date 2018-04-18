module.exports = {
  extends: 'airbnb',

  env: {
    node: true,
    jest: true,
    browser: true,
  },

  rules: {
    'max-len': [2, 100],
    'no-console': 2,
    'react/prop-types': 0,
    'no-multiple-empty-lines': [2, { max: 1, maxBOF: 1, maxEOF: 1 }],
    'no-unused-vars': [2, { args: 'none' }],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],
  },
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb',
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:json/recommended',
    'plugin:sonarjs/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'jest',
    'sonarjs',
  ],
  overrides: [
    {
      files: ['*.js', '*.json'],
      rules: {
        'quote-props': ['error', 'consistent'],
        'max-len': ['error', { 'code': 80, 'ignoreUrls': true }],
        'no-underscore-dangle': ['error', { 'allowAfterThis': true }],
        'no-buffer-constructor': 'off',
      },
    },
  ],
};

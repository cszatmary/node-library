module.exports = {
  extends: ['./prettier.js'],
  rules: {
    'no-underscore-dangle': ['off'],
    camelcase: ['error', { properties: 'always' }],
    'arrow-body-style': ['off'],
    'arrow-parens': ['off'],
    'lines-around-directive': ['off'],
    'no-plusplus': ['off'],
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'space-before-function-paren': ['off'],
    'operator-linebreak': ['off'],
    'implicit-arrow-linebreak': ['off'],
  },
  env: {
    node: true,
    jest: true,
  },
};

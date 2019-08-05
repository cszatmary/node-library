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
  },
  env: {
    node: true,
    jest: true,
  },
};

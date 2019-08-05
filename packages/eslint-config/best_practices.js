module.exports = {
  extends: ['airbnb-base'],
  rules: {
    eqeqeq: ['error', 'allow-null'],
    'no-console': ['off'],
    'no-param-reassign': ['error', { props: false }],
    'class-methods-use-this': ['off'],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-constant-condition': ['off'],
    'no-nested-ternary': ['off'],
    'no-else-return': ['off'],
  },
  env: {
    node: true,
    jest: true,
  },
};

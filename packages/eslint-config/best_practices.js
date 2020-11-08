module.exports = {
  extends: ["airbnb-base"],
  rules: {
    "class-methods-use-this": ["off"],
    curly: ["error"],
    "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
    "max-classes-per-file": ["off"],
    "no-console": ["off"],
    "no-constant-condition": ["off"],
    "no-continue": ["off"],
    "no-else-return": ["off"],
    "no-nested-ternary": ["off"],
    "no-param-reassign": ["error", { props: false }],
    "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
    "no-ternary": ["error"],
    "prefer-destructuring": ["error", { object: true, array: false }],
  },
  env: {
    node: true,
    jest: true,
  },
};

module.exports = {
  extends: ["airbnb-base"],
  rules: {
    "no-console": ["off"],
    "no-param-reassign": ["error", { props: false }],
    "class-methods-use-this": ["off"],
    "prefer-destructuring": ["error", { object: true, array: false }],
    "no-constant-condition": ["off"],
    "no-nested-ternary": ["off"],
    "no-else-return": ["off"],
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "no-continue": ["off"],
    "lines-between-class-members": [
      "error",
      "always",
      { exceptAfterSingleLine: true },
    ],
  },
  env: {
    node: true,
    jest: true,
  },
};

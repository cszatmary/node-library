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
    "no-restricted-syntax": [
      "error",
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      {
        selector: "ThrowStatement",
        message:
          "`throw` leads to convoluted code that is hard to follow. Consider returning an error value instead. If the situation is truly exceptional, use `panic`.",
      },
      {
        selector: "TryStatement",
        message:
          "`try` leads to convoluted code and treats common errors as exceptional. Use Result.of instead.",
      },
      {
        selector: "WithStatement",
        message:
          "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],
    "no-ternary": ["error"],
    "prefer-destructuring": ["error", { object: true, array: false }],
  },
  env: {
    node: true,
    jest: true,
  },
};

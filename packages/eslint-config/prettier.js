module.exports = {
  extends: ["prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": ["error"],
    camelcase: ["error", { properties: "always" }],
    "lines-around-directive": ["off"],
    "no-underscore-dangle": ["off"],
    "no-plusplus": ["off"],
    "spaced-comment": ["error", "always", { markers: ["/"] }],
  },
  env: {
    node: true,
    jest: true,
  },
};

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:import/typescript",
  ],
  rules: {
    camelcase: ["off"],
    "@typescript-eslint/camelcase": ["error", { properties: "always" }],
    "@typescript-eslint/explicit-function-return-type": ["error"],
    "@typescript-eslint/no-explicit-any": ["error"],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-non-null-assertion": ["error"],
    "no-useless-constructor": ["off"],
    "@typescript-eslint/no-useless-constructor": ["error"],
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-dupe-class-members": ["error"],
    "import/no-unresolved": ["off"],
    "consistent-return": ["off"],
  },
  env: {
    node: true,
    jest: true,
  },
};

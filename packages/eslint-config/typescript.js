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
    "no-use-before-define": ["off"],
    "@typescript-eslint/naming-convention": ["error"],
    "@typescript-eslint/explicit-function-return-type": ["error"],
    "@typescript-eslint/no-explicit-any": ["error"],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-use-before-define": ["error"],
    "@typescript-eslint/no-non-null-assertion": ["error"],
    "no-useless-constructor": ["off"],
    "@typescript-eslint/no-useless-constructor": ["error"],
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-dupe-class-members": ["error"],
    "import/no-unresolved": ["off"],
    "consistent-return": ["off"],
    "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
  },
  env: {
    node: true,
    jest: true,
  },
};

module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    souceType: "module",
  },
  plugins: ["import"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".json"],
      },
    },
    "import/ignore": ["node_modules", "\\.json$"],
  },
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/test/**", "**/__tests__/**", "**/scripts/**"],
      },
    ],
    "import/named": ["off"],
    "import/extensions": ["error", { js: "never", json: "always" }],
    "import/prefer-default-export": ["off"],
    "import/no-default-export": ["error"],
  },
  env: {
    es6: true,
  },
};

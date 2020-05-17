module.exports = {
  extends: ["./best_practices.js", "./prettier.js", "./import.js", "./typescript.js"],
  rules: {},
  env: {
    node: true,
    jest: true,
  },
};

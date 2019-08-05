module.exports = {
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
  env: {
    node: true,
    jest: true,
  },
};

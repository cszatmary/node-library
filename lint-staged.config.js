module.exports = {
  '*.{js,ts}': ['eslint --fix --ext=js,ts', 'git add'],
  '*.json': ['prettier --write', 'git add'],
};

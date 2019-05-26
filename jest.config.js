module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.(ts|js)'],
  testEnvironment: 'node',
  collectCoverageFrom: ['packages/**/src/**/*.(js|ts)']
};

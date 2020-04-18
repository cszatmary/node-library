module.exports = {
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/test/**/*.test.(ts|js)"],
  testEnvironment: "node",
  collectCoverageFrom: ["packages/**/src/**/*.(js|ts)"],
  setupFilesAfterEnv: ["<rootDir>/packages/node-stdlib/test/setup.ts"],
};

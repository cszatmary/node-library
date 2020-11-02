module.exports = {
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    runtime$: "<rootDir>/packages/node-stdlib/src/_runtime/runtime_node.ts",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/test/**/*.test.(ts|js)"],
  testPathIgnorePatterns: ["/test/deno/"],
  testEnvironment: "node",
  collectCoverageFrom: ["packages/**/src/**/*.(js|ts)"],
  coveragePathIgnorePatterns: ["<rootDir>/packages/node-stdlib/src/_runtime"],
  setupFilesAfterEnv: ["<rootDir>/packages/node-stdlib/test/setup.ts"],
};

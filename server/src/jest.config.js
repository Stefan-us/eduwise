module.exports = {
    testEnvironment: 'node',
    testMatch: [
      "**/src/testing/**/__tests__/**/*.test.js",
      "**/src/testing/**/*.test.js"
    ],
    collectCoverageFrom: [
      "src/**/*.js",
      "!src/testing/**/*.js"
    ],
    coverageDirectory: "coverage",
    verbose: true,
    setupFilesAfterEnv: ['./jest.setup.js']
  };
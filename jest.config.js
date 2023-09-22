/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['clover', 'json', 'lcov', ['text', {skipFull: true}]],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
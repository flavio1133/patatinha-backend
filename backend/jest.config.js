module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/migrations/',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
};

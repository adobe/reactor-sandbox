// jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/src/**']
    }
  ],

  collectCoverageFrom: [
    './src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/__tests__/**'
  ],

  coverageReporters: ['lcov', 'text', 'html']
};

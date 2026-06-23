const baseConfig = require('../../jest.base.config');

module.exports = {
  ...baseConfig,
  rootDir: '../..',
  testMatch: ['<rootDir>/tests/e2e/**/*.e2e-spec.ts'],
};

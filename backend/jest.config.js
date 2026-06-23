const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*spec.ts'],
  collectCoverageFrom: [
    'apps/**/*.{ts,js}',
    'libs/**/*.{ts,js}',
    '!apps/**/*.d.ts',
    '!libs/**/*.d.ts',
    '!dist/**',
    '!**/*.config.{ts,js}',
  ],
  coverageDirectory: 'coverage',
};

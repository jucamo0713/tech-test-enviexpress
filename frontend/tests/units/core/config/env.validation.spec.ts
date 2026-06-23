import { validateEnvironment } from '../../../../src/app/core/config';
import type { EnvironmentVariables } from '../../../../src/app/core/config';

const validEnvironment: EnvironmentVariables = {
  NODE_ENV: 'test',
  APP_NAME: 'frontend-test',
  API_BASE_URL: '/api',
  DEFAULT_LOCALE: 'en-US',
  LOG_LEVEL: 'warn',
  DEFAULT_TIMEOUT_MS: 30000,
};

describe('validateEnvironment', () => {
  it('returns a valid environment', () => {
    expect(validateEnvironment(validEnvironment)).toEqual(validEnvironment);
  });

  it('rejects an invalid API base URL', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        API_BASE_URL: '',
      }),
    ).toThrow('API_BASE_URL');
  });

  it('rejects an invalid timeout', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DEFAULT_TIMEOUT_MS: 0,
      }),
    ).toThrow('DEFAULT_TIMEOUT_MS');
  });
});

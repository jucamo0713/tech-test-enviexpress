import { EnvironmentVariables } from '../app/core/config';

export const environment: EnvironmentVariables = {
  NODE_ENV: 'test',
  APP_NAME: 'frontend-test',
  API_BASE_URL: '/api',
  DEFAULT_LOCALE: 'en-US',
  LOG_LEVEL: 'warn',
  DEFAULT_TIMEOUT_MS: 30000,
};

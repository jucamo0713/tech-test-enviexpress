import { EnvironmentVariables, LogLevel, NodeEnvironment } from './env.types';

const NODE_ENV_VALUES: readonly NodeEnvironment[] = [
  'development',
  'test',
  'production',
];

const LOG_LEVEL_VALUES: readonly LogLevel[] = [
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

export function validateEnvironment(
  value: EnvironmentVariables,
): EnvironmentVariables {
  const errors: string[] = [];

  if (!NODE_ENV_VALUES.includes(value.NODE_ENV)) {
    errors.push('NODE_ENV must be development, test, or production');
  }

  if (!value.APP_NAME.trim()) {
    errors.push('APP_NAME is required');
  }

  if (!isValidBaseUrl(value.API_BASE_URL)) {
    errors.push('API_BASE_URL must be an absolute URL or an absolute path');
  }

  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(value.DEFAULT_LOCALE)) {
    errors.push('DEFAULT_LOCALE must use a locale format such as en-US or es-CO');
  }

  if (!LOG_LEVEL_VALUES.includes(value.LOG_LEVEL)) {
    errors.push('LOG_LEVEL must be error, warn, log, debug, or verbose');
  }

  if (
    !Number.isInteger(value.DEFAULT_TIMEOUT_MS) ||
    value.DEFAULT_TIMEOUT_MS < 1 ||
    value.DEFAULT_TIMEOUT_MS > 300000
  ) {
    errors.push('DEFAULT_TIMEOUT_MS must be an integer between 1 and 300000');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid frontend environment: ${errors.join('; ')}`);
  }

  return value;
}

function isValidBaseUrl(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  if (value.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

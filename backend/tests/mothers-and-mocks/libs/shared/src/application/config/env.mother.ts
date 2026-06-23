import { EnvironmentVariables } from '@shared/application/config';

export const EnvMother = {
  valid(overrides: Partial<EnvironmentVariables> = {}): EnvironmentVariables {
    return {
      NODE_ENV: 'test',
      PORT: 3000,
      APP_NAME: 'test-backend',
      API_PREFIX: 'api',
      LOG_LEVEL: 'log',
      DEFAULT_TIMEOUT_MS: 30000,
      MONGO_ENABLED: false,
      MONGO_URI: 'mongodb://localhost:27017/enviexpress-test',
      REDIS_URL: 'redis://localhost:6379',
      GRPC_AUTH_URL: '0.0.0.0:50051',
      GRPC_USERS_URL: '0.0.0.0:50052',
      GRPC_CLIENTS_URL: '0.0.0.0:50053',
      GRPC_PACKAGES_URL: '0.0.0.0:50054',
      GRPC_PACKAGE_STATUS_URL: '0.0.0.0:50055',
      JWT_ACCESS_SECRET: 'test-super-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      ...overrides,
    };
  },
} as const;

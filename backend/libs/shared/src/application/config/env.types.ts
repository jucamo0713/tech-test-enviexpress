export type NodeEnvironment = 'development' | 'test' | 'production';

export type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose';

export interface EnvironmentVariables {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  APP_NAME: string;
  API_PREFIX: string;
  LOG_LEVEL: LogLevel;
  DEFAULT_TIMEOUT_MS: number;
  MONGO_ENABLED: boolean;
  MONGO_URI: string;
  REDIS_URL: string;
  GRPC_AUTH_URL: string;
  GRPC_USERS_URL: string;
  GRPC_CLIENTS_URL: string;
  GRPC_PACKAGES_URL: string;
  GRPC_PACKAGE_STATUS_URL: string;
  GRPC_AUDIT_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  SWAGGER_ENABLED?: boolean;
  SWAGGER_PATH?: string;
  SWAGGER_TITLE?: string;
  SWAGGER_DESCRIPTION?: string;
  SWAGGER_VERSION?: string;
}

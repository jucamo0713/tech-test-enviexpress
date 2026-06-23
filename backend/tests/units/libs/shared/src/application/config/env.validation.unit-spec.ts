import { envValidationSchema } from '@shared/application/config';

const validEnvironmentVariables = {
  NODE_ENV: 'production',
  PORT: 8080,
  APP_NAME: 'croper-backend',
  API_PREFIX: 'api/v1',
  LOG_LEVEL: 'debug',
  DEFAULT_TIMEOUT_MS: 15000,
  MONGO_ENABLED: false,
  MONGO_URI: 'mongodb://localhost:27017/enviexpress-test',
  REDIS_URL: 'redis://localhost:6379',
  GRPC_AUTH_URL: '0.0.0.0:50051',
  GRPC_USERS_URL: '0.0.0.0:50052',
  GRPC_CLIENTS_URL: '0.0.0.0:50053',
  GRPC_PACKAGES_URL: '0.0.0.0:50054',
  GRPC_PACKAGE_STATUS_URL: '0.0.0.0:50055',
  GRPC_AUDIT_URL: '0.0.0.0:50056',
  JWT_ACCESS_SECRET: 'test-super-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  SWAGGER_ENABLED: true,
  SWAGGER_PATH: 'docs',
  SWAGGER_TITLE: 'Croper API',
  SWAGGER_DESCRIPTION: 'Croper backend API documentation',
  SWAGGER_VERSION: '1.0.0',
};

describe('envValidationSchema', () => {
  describe('validate', () => {
    it('should accept valid environment variables', () => {
      const validationResult = envValidationSchema.validate(
        validEnvironmentVariables,
      );

      expect(validationResult.error).toBeUndefined();
      expect(validationResult.value).toEqual(validEnvironmentVariables);
    });

    it('should reject missing environment variables', () => {
      const validationResult = envValidationSchema.validate({});

      expect(validationResult.error).toBeDefined();
      expect(validationResult.error?.details[0].path).toEqual(['NODE_ENV']);
    });

    it('should reject invalid NODE_ENV', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        NODE_ENV: 'local',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['NODE_ENV']);
    });

    it('should reject invalid PORT', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        PORT: 'not-a-port',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['PORT']);
    });

    it('should reject PORT outside the allowed range', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        PORT: 65536,
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['PORT']);
    });

    it('should reject invalid LOG_LEVEL', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        LOG_LEVEL: 'trace',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['LOG_LEVEL']);
    });

    it('should reject invalid DEFAULT_TIMEOUT_MS', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        DEFAULT_TIMEOUT_MS: 0,
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['DEFAULT_TIMEOUT_MS']);
    });

    it('should reject invalid MONGO_URI', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        MONGO_URI: 'not-a-mongo-uri',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['MONGO_URI']);
    });

    it('should reject invalid REDIS_URL', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        REDIS_URL: 'not-a-redis-uri',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['REDIS_URL']);
    });

    it('should reject invalid SWAGGER_PATH', () => {
      const { error } = envValidationSchema.validate({
        ...validEnvironmentVariables,
        SWAGGER_PATH: '/docs',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(['SWAGGER_PATH']);
    });
  });
});

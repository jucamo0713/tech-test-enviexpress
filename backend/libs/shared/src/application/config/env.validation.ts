import Joi from 'joi';
import { EnvironmentVariables } from './env.types';

export const envValidationSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  PORT: Joi.number().integer().min(1).max(65535).required(),
  APP_NAME: Joi.string().required(),
  API_PREFIX: Joi.string().required(),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .required(),
  DEFAULT_TIMEOUT_MS: Joi.number().integer().min(1).max(300000).required(),
  MONGO_ENABLED: Joi.boolean().required(),
  MONGO_URI: Joi.string()
    .uri({
      scheme: ['mongodb', 'mongodb+srv'],
    })
    .required(),
  REDIS_URL: Joi.string()
    .uri({
      scheme: ['redis', 'rediss'],
    })
    .required(),
  GRPC_AUTH_URL: Joi.string().required(),
  GRPC_USERS_URL: Joi.string().required(),
  GRPC_CLIENTS_URL: Joi.string().required(),
  GRPC_PACKAGES_URL: Joi.string().required(),
  GRPC_PACKAGE_STATUS_URL: Joi.string().required(),
  GRPC_AUDIT_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  SWAGGER_ENABLED: Joi.boolean().optional(),
  SWAGGER_PATH: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/)
    .optional(),
  SWAGGER_TITLE: Joi.string().trim().optional(),
  SWAGGER_DESCRIPTION: Joi.string().trim().optional(),
  SWAGGER_VERSION: Joi.string().trim().optional(),
});

import {
  AppLogger,
  ExceptionFilter,
  GrpcClientFactory,
  LoggerInterceptor,
  NestCqrsCaller,
  RedisPubSubClient,
  RequestContextInterceptor,
  TimeoutInterceptor,
} from '@shared/infrastructure/driven-adapters';

export const SharedProviders = [
  AppLogger,
  ExceptionFilter,
  GrpcClientFactory,
  LoggerInterceptor,
  NestCqrsCaller,
  RequestContextInterceptor,
  RedisPubSubClient,
  TimeoutInterceptor,
];

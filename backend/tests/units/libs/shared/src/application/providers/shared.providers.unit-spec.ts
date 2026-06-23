import { SharedProviders } from '@shared/application/providers';
import {
  AppLogger,
  ExceptionFilter,
  GrpcClientFactory,
  LoggerInterceptor,
  RedisPubSubClient,
  RequestContextInterceptor,
  TimeoutInterceptor,
} from '@shared/infrastructure/driven-adapters';

describe('SharedProviders', () => {
  describe('registration', () => {
    it('should register shared infrastructure providers used by bootstraps', () => {
      expect(SharedProviders).toEqual(
        expect.arrayContaining([
          AppLogger,
          ExceptionFilter,
          GrpcClientFactory,
          LoggerInterceptor,
          RedisPubSubClient,
          RequestContextInterceptor,
          TimeoutInterceptor,
        ]),
      );
    });
  });
});

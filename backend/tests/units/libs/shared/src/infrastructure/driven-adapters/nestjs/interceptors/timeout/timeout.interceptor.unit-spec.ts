import { Logger, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, NEVER } from 'rxjs';
import type { EnvironmentVariables } from '@shared/application/config';
import { TimeoutInterceptor } from '@shared/infrastructure/driven-adapters/nestjs/interceptors/timeout';
import { TimeoutInterceptorConstants } from '@shared/infrastructure/driven-adapters/nestjs/interceptors/timeout/timeout.interceptor.constants';
import { HttpMock } from '@tests/mothers-and-mocks/libs/shared/src/infrastructure/driven-adapters/nestjs/http.mock';

describe('TimeoutInterceptor', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('intercept', () => {
    it('should return the handler observable when timeout is cancelled', async () => {
      const reflector = {
        get: jest.fn((key: TimeoutInterceptorConstants) =>
          key === TimeoutInterceptorConstants.CANCEL_TIMEOUT_METADATA_KEY
            ? true
            : undefined,
        ),
      } as unknown as Reflector;
      const configServiceMock = {
        getOrThrow: jest.fn(),
      };
      const configService = configServiceMock as unknown as ConfigService<
        EnvironmentVariables,
        true
      >;
      const interceptor = new TimeoutInterceptor(reflector, configService);

      await expect(
        lastValueFrom(
          interceptor.intercept(
            HttpMock.executionContext(),
            HttpMock.callHandler('ok'),
          ),
        ),
      ).resolves.toBe('ok');
      expect(configServiceMock.getOrThrow).not.toHaveBeenCalled();
    });

    it('should use the configured default timeout when metadata is missing', async () => {
      const reflector = {
        get: jest.fn(() => undefined),
      } as unknown as Reflector;
      const configServiceMock = {
        getOrThrow: jest.fn(() => 100),
      };
      const configService = configServiceMock as unknown as ConfigService<
        EnvironmentVariables,
        true
      >;
      const interceptor = new TimeoutInterceptor(reflector, configService);

      await expect(
        lastValueFrom(
          interceptor.intercept(
            HttpMock.executionContext(),
            HttpMock.callHandler('ok'),
          ),
        ),
      ).resolves.toBe('ok');
      expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
        'DEFAULT_TIMEOUT_MS',
        { infer: true },
      );
    });

    it('should throw RequestTimeoutException when execution exceeds timeout', async () => {
      const reflector = {
        get: jest.fn((key: TimeoutInterceptorConstants) =>
          key === TimeoutInterceptorConstants.TIMEOUT_METADATA_KEY
            ? 1
            : undefined,
        ),
      } as unknown as Reflector;
      const configServiceMock = {
        getOrThrow: jest.fn(() => 100),
      };
      const configService = configServiceMock as unknown as ConfigService<
        EnvironmentVariables,
        true
      >;
      const interceptor = new TimeoutInterceptor(reflector, configService);

      await expect(
        lastValueFrom(
          interceptor.intercept(HttpMock.executionContext(), {
            handle: jest.fn(() => NEVER),
          }),
        ),
      ).rejects.toBeInstanceOf(RequestTimeoutException);
    });

    it('should preserve non-timeout errors from the handler', async () => {
      const reflector = {
        get: jest.fn(() => undefined),
      } as unknown as Reflector;
      const configServiceMock = {
        getOrThrow: jest.fn(() => 100),
      };
      const configService = configServiceMock as unknown as ConfigService<
        EnvironmentVariables,
        true
      >;
      const interceptor = new TimeoutInterceptor(reflector, configService);

      await expect(
        lastValueFrom(
          interceptor.intercept(
            HttpMock.executionContext(),
            HttpMock.throwingCallHandler(new Error('failed')),
          ),
        ),
      ).rejects.toThrow('failed');
    });
  });
});

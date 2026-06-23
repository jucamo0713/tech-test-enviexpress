import { Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { LoggerInterceptor } from '@shared/infrastructure/driven-adapters/nestjs/interceptors/logger';
import { LoggerInterceptorConstants } from '@shared/infrastructure/driven-adapters/nestjs/interceptors/logger/logger.interceptor.constants';
import { HttpMock } from '@tests/mothers-and-mocks/libs/shared/src/infrastructure/driven-adapters/nestjs/http.mock';

describe('LoggerInterceptor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('resolveRequests', () => {
    it('should resolve query params for GET requests', () => {
      const context = HttpMock.executionContext({
        request: HttpMock.request({
          method: 'GET',
          query: { search: 'value' },
        }),
      });

      expect(LoggerInterceptor.resolveRequests(context)).toEqual({
        query: { search: 'value' },
      });
    });

    it('should reject unsupported context types', () => {
      const context = HttpMock.executionContext({ type: 'ws' });

      expect(() => LoggerInterceptor.resolveRequests(context)).toThrow(
        'Context Not implemented',
      );
    });
  });

  describe('intercept', () => {
    it('should log request start and response finish when logs are enabled', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const reflector = {
        get: jest.fn(() => false),
      } as unknown as Reflector;
      const interceptor = new LoggerInterceptor(reflector);
      const context = HttpMock.executionContext();
      const handler = HttpMock.callHandler({ ok: true });

      const result = await interceptor.intercept(context, handler);
      await expect(lastValueFrom(result)).resolves.toEqual({ ok: true });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('INIT :: requestId:'),
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('data:'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('FINISH ::'));
    });

    it('should skip logging when metadata disables logs', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const reflector = {
        get: jest.fn(
          (key: LoggerInterceptorConstants) =>
            key === LoggerInterceptorConstants.DONT_PRINT_LOGS_KEY,
        ),
      } as unknown as Reflector;
      const interceptor = new LoggerInterceptor(reflector);

      const result = await interceptor.intercept(
        HttpMock.executionContext(),
        HttpMock.callHandler({ ok: true }),
      );

      await expect(lastValueFrom(result)).resolves.toEqual({ ok: true });
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should log errors when the handler fails', async () => {
      jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      const reflector = {
        get: jest.fn(() => false),
      } as unknown as Reflector;
      const interceptor = new LoggerInterceptor(reflector);

      const result = await interceptor.intercept(
        HttpMock.executionContext(),
        HttpMock.throwingCallHandler(new Error('failed')),
      );

      await expect(lastValueFrom(result)).rejects.toThrow('failed');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR ::'),
      );
    });
  });
});

import { Request, Response } from 'express';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import {
  AsyncContextMiddleware,
  REQUEST_ID_HEADER,
} from '@shared/infrastructure/driven-adapters/nestjs/middlewares';
import { HttpMock } from '@tests/mothers-and-mocks/libs/shared/src/infrastructure/driven-adapters/nestjs/http.mock';

describe('AsyncContextMiddleware', () => {
  describe('use', () => {
    it('should store the request id in the async request context', () => {
      const middleware = new AsyncContextMiddleware();
      const request = HttpMock.request({
        headers: { [REQUEST_ID_HEADER]: 'request-id-1' },
      }) as Request;
      const response = HttpMock.response() as unknown as Response;
      const next = jest.fn(() => {
        expect(AsyncRequestContext.get('requestId')).toBe('request-id-1');
      });

      middleware.use(request, response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should use the first string request id when the header has multiple values', () => {
      const middleware = new AsyncContextMiddleware();
      const request = HttpMock.request({
        headers: { [REQUEST_ID_HEADER]: ['request-id-1', 'request-id-2'] },
      }) as Request;
      const response = HttpMock.response() as unknown as Response;
      const next = jest.fn(() => {
        expect(AsyncRequestContext.get('requestId')).toBe('request-id-1');
      });

      middleware.use(request, response, next);

      expect(request.headers[REQUEST_ID_HEADER]).toBe('request-id-1');
      expect(next).toHaveBeenCalled();
    });

    it('should generate a request id when the header is missing', () => {
      const middleware = new AsyncContextMiddleware();
      const request = HttpMock.request() as Request;
      const response = HttpMock.response() as unknown as Response;
      const next = jest.fn(() => {
        expect(AsyncRequestContext.get('requestId')).toEqual(
          expect.any(String),
        );
      });

      middleware.use(request, response, next);

      expect(request.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
      expect(next).toHaveBeenCalled();
    });
  });
});

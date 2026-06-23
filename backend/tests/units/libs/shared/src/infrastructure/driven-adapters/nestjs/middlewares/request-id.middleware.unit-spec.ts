import { Request, Response } from 'express';
import {
  REQUEST_ID_HEADER,
  RequestIdMiddleware,
} from '@shared/infrastructure/driven-adapters/nestjs/middlewares';
import { HttpMock } from '@tests/mothers-and-mocks/libs/shared/src/infrastructure/driven-adapters/nestjs/http.mock';

describe('RequestIdMiddleware', () => {
  describe('use', () => {
    it('should reuse an existing request id', () => {
      const middleware = new RequestIdMiddleware();
      const request = HttpMock.request({
        headers: { [REQUEST_ID_HEADER]: 'request-id-1' },
      }) as Request;
      const responseMock = HttpMock.response();
      const response = responseMock as unknown as Response;
      const next = jest.fn();

      middleware.use(request, response, next);

      expect(request.headers[REQUEST_ID_HEADER]).toBe('request-id-1');
      expect(responseMock.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        'request-id-1',
      );
      expect(next).toHaveBeenCalled();
    });

    it('should generate a request id when it is missing', () => {
      const middleware = new RequestIdMiddleware();
      const request = HttpMock.request() as Request;
      const responseMock = HttpMock.response();
      const response = responseMock as unknown as Response;

      middleware.use(request, response, jest.fn());

      expect(request.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
      expect(responseMock.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        request.headers[REQUEST_ID_HEADER],
      );
    });

    it('should use the first string request id when the header has multiple values', () => {
      const middleware = new RequestIdMiddleware();
      const request = HttpMock.request({
        headers: { [REQUEST_ID_HEADER]: ['request-id-1', 'request-id-2'] },
      }) as Request;
      const responseMock = HttpMock.response();
      const response = responseMock as unknown as Response;
      const next = jest.fn();

      middleware.use(request, response, next);

      expect(request.headers[REQUEST_ID_HEADER]).toBe('request-id-1');
      expect(responseMock.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        'request-id-1',
      );
      expect(next).toHaveBeenCalled();
    });
  });
});

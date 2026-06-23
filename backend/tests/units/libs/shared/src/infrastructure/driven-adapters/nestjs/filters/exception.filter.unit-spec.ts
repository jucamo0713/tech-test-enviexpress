import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import { ExceptionFilter } from '@shared/infrastructure/driven-adapters/nestjs/filters';
import { HttpMock } from '@tests/mothers-and-mocks/libs/shared/src/infrastructure/driven-adapters/nestjs/http.mock';

describe('ExceptionFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('catch', () => {
    it('should map controlled HTTP exceptions into the standard response', () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const filter = new ExceptionFilter();
      const response = HttpMock.response();
      const context = HttpMock.executionContext({ response });

      AsyncRequestContext.setData({ requestId: 'request-id-1' }, () => {
        filter.catch(new BadRequestException('Invalid request'), context);
      });

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          httpStatusCode: 400,
          message: 'Invalid request',
          method: 'GET',
          path: '/api/test',
          requestId: 'request-id-1',
        }),
      );
    });

    it('should map uncontrolled errors into internal server errors', () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const filter = new ExceptionFilter();
      const response = HttpMock.response();
      const context = HttpMock.executionContext({ response });

      filter.catch(new Error('Unexpected'), context);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          httpStatusCode: 500,
          message: 'Unexpected',
          requestId: 'undefined',
        }),
      );
    });

    it('should map RPC errors into RpcException payloads', async () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const filter = new ExceptionFilter();
      const result = filter.catch(
        new Error('RPC failed'),
        HttpMock.executionContext({ type: 'rpc' }),
      );

      await expect(lastValueFrom(result!)).rejects.toThrow(RpcException);
    });

    it('should reject unsupported protocols', () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const filter = new ExceptionFilter();

      expect(() =>
        filter.catch(
          new Error('Unexpected'),
          HttpMock.executionContext({ type: 'ws' }),
        ),
      ).toThrow(InternalServerErrorException);
    });
  });
});

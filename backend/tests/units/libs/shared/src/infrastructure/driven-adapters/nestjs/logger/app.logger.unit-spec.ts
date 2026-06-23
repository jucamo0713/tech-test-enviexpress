import { ConsoleLogger } from '@nestjs/common';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import { AppLogger } from '@shared/infrastructure/driven-adapters/nestjs/logger';

describe('AppLogger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('should append the request id to the log context when it exists', () => {
      const logSpy = jest
        .spyOn(ConsoleLogger.prototype, 'log')
        .mockImplementation();
      const logger = new AppLogger();

      AsyncRequestContext.setData({ requestId: 'request-id-1' }, () => {
        logger.log('message', 'TestContext');
      });

      expect(logSpy).toHaveBeenCalledWith(
        'message',
        'TestContext] [RequestId: request-id-1',
      );
    });

    it('should keep the original context when request id is missing', () => {
      const logSpy = jest
        .spyOn(ConsoleLogger.prototype, 'log')
        .mockImplementation();
      const logger = new AppLogger();

      logger.log('message', 'TestContext');

      expect(logSpy).toHaveBeenCalledWith('message', 'TestContext');
    });
  });
});

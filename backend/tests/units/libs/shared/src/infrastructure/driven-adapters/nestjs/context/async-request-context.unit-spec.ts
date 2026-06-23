import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';

describe('AsyncRequestContext', () => {
  describe('setData', () => {
    it('should expose data inside the async context', () => {
      AsyncRequestContext.setData({ requestId: 'request-id-1' }, () => {
        expect(AsyncRequestContext.getData()).toEqual({
          requestId: 'request-id-1',
        });
        expect(AsyncRequestContext.get('requestId')).toBe('request-id-1');
      });
    });
  });

  describe('setDataForCurrentContext', () => {
    it('should update data inside the current async context', () => {
      AsyncRequestContext.setData({ requestId: 'request-id-1' }, () => {
        AsyncRequestContext.setDataForCurrentContext(
          'requestId',
          'request-id-2',
        );

        expect(AsyncRequestContext.get('requestId')).toBe('request-id-2');
      });
    });

    it('should reject updates when there is no async context', () => {
      expect(() =>
        AsyncRequestContext.setDataForCurrentContext(
          'requestId',
          'request-id-2',
        ),
      ).toThrow('No context set');
    });
  });
});

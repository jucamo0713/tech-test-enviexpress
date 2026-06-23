import { BadRequestException } from '@nestjs/common';
import { ErrorUtils } from '@shared/domain/use-cases/utils';

describe('ErrorUtils', () => {
  describe('resolveErrorMessage', () => {
    it('should resolve messages from NestJS HTTP exceptions', () => {
      const error = new BadRequestException(['one', 'two']);

      expect(ErrorUtils.resolveErrorMessage(error)).toBe('one, two');
    });

    it('should resolve messages from regular errors', () => {
      expect(ErrorUtils.resolveErrorMessage(new Error('unexpected'))).toBe(
        'unexpected',
      );
    });

    it('should stringify unknown object errors', () => {
      expect(ErrorUtils.resolveErrorMessage({ code: 'UNKNOWN' })).toBe(
        '{"code":"UNKNOWN"}',
      );
    });
  });

  describe('describeUnknownError', () => {
    it('should describe non-error values by type', () => {
      expect(ErrorUtils.describeUnknownError(null)).toBe('null');
      expect(ErrorUtils.describeUnknownError([])).toBe('array');
      expect(ErrorUtils.describeUnknownError('message')).toBe('string');
    });
  });
});

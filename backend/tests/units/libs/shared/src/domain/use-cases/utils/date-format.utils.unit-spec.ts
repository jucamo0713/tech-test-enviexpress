import { Timezone } from '@shared/domain/models/value-objects/string/timezone';
import { formatScheduledAt } from '@shared/domain/use-cases/utils';

describe('formatScheduledAt', () => {
  describe('format', () => {
    it('should format a date using UTC by default', () => {
      const result = formatScheduledAt(new Date('2026-06-20T13:30:00.000Z'));

      expect(result).toEqual({
        date: '2026-06-20',
        hour: '1:30 PM',
      });
    });

    it('should format a date using the provided timezone', () => {
      const result = formatScheduledAt(
        new Date('2026-06-20T02:30:00.000Z'),
        new Timezone('America/Bogota'),
      );

      expect(result).toEqual({
        date: '2026-06-19',
        hour: '9:30 PM',
      });
    });
  });
});

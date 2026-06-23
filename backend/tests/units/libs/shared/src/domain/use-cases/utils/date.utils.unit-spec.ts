import {
  DateIntervals,
  WeekDayConstants,
} from '@shared/domain/models/constants';
import { Timezone } from '@shared/domain/models/value-objects/string/timezone';
import {
  addTimeToDate,
  DateUtils,
  differenceInDays,
  endOfDay,
  findFirstOverlappingInterval,
  getWeekDayFromDate,
  truncateDate,
} from '@shared/domain/use-cases/utils';

describe('DateUtils', () => {
  describe('addTimeToDate', () => {
    it('should add time using the requested interval', () => {
      const date = new Date('2026-01-01T00:00:00.000Z');

      expect(addTimeToDate(date, 1, DateIntervals.WEEK).toISOString()).toBe(
        '2026-01-08T00:00:00.000Z',
      );
      expect(DateUtils.addMinutesToDate(date, 30).toISOString()).toBe(
        '2026-01-01T00:30:00.000Z',
      );
    });
  });

  describe('endOfDay', () => {
    it('should resolve the end of day in UTC', () => {
      const result = endOfDay(new Date('2026-06-20T10:00:00.000Z'));

      expect(result.toISOString()).toBe('2026-06-20T23:59:59.999Z');
    });
  });

  describe('differenceInDays', () => {
    it('should calculate the absolute difference between dates in days', () => {
      const result = differenceInDays(
        new Date('2026-06-20T00:00:00.000Z'),
        new Date('2026-06-22T12:00:00.000Z'),
      );

      expect(result).toBe(2.5);
    });
  });

  describe('getWeekDayFromDate', () => {
    it('should return the week day for the provided timezone', () => {
      const result = getWeekDayFromDate(
        new Date('2026-06-20T02:00:00.000Z'),
        new Timezone('America/Bogota'),
      );

      expect(result).toBe(WeekDayConstants.FRIDAY);
    });
  });

  describe('truncateDate', () => {
    it('should truncate dates by interval', () => {
      const result = truncateDate(
        new Date('2026-06-20T13:45:30.500Z'),
        DateIntervals.HOUR,
      );

      expect(result.toISOString()).toBe('2026-06-20T13:00:00.000Z');
    });
  });

  describe('findFirstOverlappingInterval', () => {
    it('should find the first overlapping interval', () => {
      const intervals = [
        {
          start: new Date('2026-06-20T08:00:00.000Z'),
          end: new Date('2026-06-20T09:00:00.000Z'),
        },
        {
          start: new Date('2026-06-20T10:00:00.000Z'),
          end: new Date('2026-06-20T11:00:00.000Z'),
        },
      ];

      const result = findFirstOverlappingInterval(
        intervals,
        new Date('2026-06-20T10:30:00.000Z'),
        new Date('2026-06-20T10:45:00.000Z'),
      );

      expect(result).toEqual({ interval: intervals[1], index: 1 });
    });

    it('should return null when no intervals overlap', () => {
      const result = findFirstOverlappingInterval(
        [],
        new Date('2026-06-20T10:30:00.000Z'),
        new Date('2026-06-20T10:45:00.000Z'),
      );

      expect(result).toBeNull();
    });
  });
});

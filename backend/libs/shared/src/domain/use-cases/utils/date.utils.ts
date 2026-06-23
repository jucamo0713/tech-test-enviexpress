import {
  DateIntervals,
  MINUTES_PER_DAY,
  MS_PER_MINUTE,
  WeekDayConstants,
} from '@shared/domain/models/constants';
import { Timezone } from '@shared/domain/models/value-objects/string/timezone';
import { IntervalLike } from '@shared/domain/models/types';
import { assertUnreachable } from './assert-unreachable.util';

/**
 * Adds a specified number of milliseconds to a given date.
 * @param date - The original date to which milliseconds will be added.
 * @param msToADD - The number of milliseconds to add to the date.
 * @returns A new `Date` object with the added milliseconds.
 */
export function addMsToDate(date: Date, msToADD: number): Date {
  date = new Date(date);
  date.setUTCMilliseconds(date.getUTCMilliseconds() + msToADD);
  return date;
}

/**
 * Adds a specified number of seconds to a given date.
 * @param date - The original date to which seconds will be added.
 * @param secondsToADD - The number of seconds to add to the date.
 * @returns A new `Date` object with the added seconds.
 */
export function addSecondsToDate(date: Date, secondsToADD: number): Date {
  date = new Date(date);
  date.setUTCSeconds(date.getUTCSeconds() + secondsToADD);
  return date;
}

/**
 * Adds a specified number of minutes to a given date.
 * @param date - The original date to which minutes will be added.
 * @param minutesToADD - The number of minutes to add to the date.
 * @returns A new `Date` object with the added minutes.
 */
export function addMinutesToDate(date: Date, minutesToADD: number): Date {
  date = new Date(date);
  date.setUTCMinutes(date.getUTCMinutes() + minutesToADD);
  return date;
}

/**
 * Adds a specified number of hours to a given date.
 * @param date - The original date to which hours will be added.
 * @param hoursToADD - The number of hours to add to the date.
 * @returns A new `Date` object with the added hours.
 */
export function addHoursToDate(date: Date, hoursToADD: number): Date {
  date = new Date(date);
  date.setUTCHours(date.getUTCHours() + hoursToADD);
  return date;
}

/**
 * Adds a specified number of days to a given date.
 * @param date - The original date to which days will be added.
 * @param daysToADD - The number of days to add to the date.
 * @returns A new `Date` object with the added days.
 */
export function addDaysToDate(date: Date, daysToADD: number): Date {
  date = new Date(date);
  date.setUTCDate(date.getUTCDate() + daysToADD);
  return date;
}

/**
 * Adds a specified number of months to a given date.
 * @param date - The original date to which months will be added.
 * @param monthsToADD - The number of months to add to the date.
 * @returns A new `Date` object with the added months.
 */
export function addMonthsToDate(date: Date, monthsToADD: number): Date {
  date = new Date(date);
  date.setUTCMonth(date.getUTCMonth() + monthsToADD);
  return date;
}

/**
 * Adds a specified number of years to a given date.
 * @param date - The original date to which years will be added.
 * @param yearsToADD - The number of years to add to the date.
 * @returns A new `Date` object with the added years.
 */
export function addYearsToDate(date: Date, yearsToADD: number): Date {
  date = new Date(date);
  date.setUTCFullYear(date.getUTCFullYear() + yearsToADD);
  return date;
}

export function addTimeToDate(
  date: Date,
  timeToAdd: number,
  unit: DateIntervals,
): Date {
  switch (unit) {
    case DateIntervals.YEAR:
      return addYearsToDate(date, timeToAdd);
    case DateIntervals.MONTH:
      return addMonthsToDate(date, timeToAdd);
    case DateIntervals.DAY:
      return addDaysToDate(date, timeToAdd);
    case DateIntervals.HOUR:
      return addHoursToDate(date, timeToAdd);
    case DateIntervals.MINUTE:
      return addMinutesToDate(date, timeToAdd);
    case DateIntervals.SECOND:
      return addSecondsToDate(date, timeToAdd);
    case DateIntervals.QUARTER:
      return addMonthsToDate(date, timeToAdd * 3);
    case DateIntervals.WEEK:
      return addDaysToDate(date, timeToAdd * 7);
    default:
      assertUnreachable(unit);
  }
}

function toTimezoneWorkingDate(date: Date, timezone?: Timezone): Date {
  const originalDate = new Date(date);
  if (!timezone) {
    return originalDate;
  }

  return new Date(
    originalDate.getTime() + getOffsetForTimezone(originalDate, timezone),
  );
}

function fromTimezoneWorkingDate(date: Date, timezone?: Timezone): Date {
  if (!timezone) {
    return new Date(date);
  }

  const workingDate = new Date(date);
  return new Date(
    workingDate.getTime() - getOffsetForTimezone(workingDate, timezone),
  );
}

export function addTimeToDateInTimezone(
  date: Date,
  timeToAdd: number,
  unit: DateIntervals,
  timezone?: Timezone,
): Date {
  const workingDate = toTimezoneWorkingDate(date, timezone);
  const shiftedDate = addTimeToDate(workingDate, timeToAdd, unit);
  return fromTimezoneWorkingDate(shiftedDate, timezone);
}

export function endOfDay(date: Date, timezone?: Timezone): Date {
  const workingDate = toTimezoneWorkingDate(date, timezone);
  const endOfWorkingDay = new Date(
    Date.UTC(
      workingDate.getUTCFullYear(),
      workingDate.getUTCMonth(),
      workingDate.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  return fromTimezoneWorkingDate(endOfWorkingDay, timezone);
}
/**
 * Calculates the absolute difference between two dates expressed in days.
 * @param startDate - The initial date.
 * @param endDate - The final date.
 * @returns The difference in days as a floating-point number.
 */
export function differenceInDays(startDate: Date, endDate: Date): number {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const diffMs = Math.abs(end - start);
  return diffMs / (MS_PER_MINUTE * MINUTES_PER_DAY);
}

/**
 * Gets the offset in milliseconds from UTC for the provided timezone at the specified date.
 * @param date - The reference date.
 * @param timezone - The timezone to evaluate.
 */
export function getOffsetForTimezone(date: Date, timezone: Timezone): number {
  const timeZoneId = timezone.toString();

  // UTC always has zero offset
  if (timeZoneId === 'UTC') {
    return 0;
  }

  const reference = new Date(date);
  const dtf = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone: timeZoneId,
    year: 'numeric',
  });
  const parts = dtf.formatToParts(reference);
  const values: Record<string, string> = {};

  parts.forEach(({ type, value }) => {
    values[type] = value;
  });

  const tzDate = new Date(
    Date.UTC(
      Number(values['year']),
      Number(values['month']) - 1,
      Number(values['day']),
      Number(values['hour']),
      Number(values['minute']),
      Number(values['second']),
      reference.getUTCMilliseconds(),
    ),
  );

  return tzDate.getTime() - reference.getTime();
}

/**
 * Returns the {@link WeekDayConstants} corresponding to the provided date.
 * @param date - The reference date.
 * @param timezone - Optional timezone used to adjust the day calculation (defaults to UTC).
 */
export function getWeekDayFromDate(
  date: Date,
  timezone?: Timezone,
): WeekDayConstants {
  const reference = new Date(date);
  if (timezone) {
    const offset = getOffsetForTimezone(reference, timezone);
    reference.setTime(reference.getTime() + offset);
  }
  const weekDayIndex = reference.getUTCDay();
  switch (weekDayIndex) {
    case 0:
      return WeekDayConstants.SUNDAY;
    case 1:
      return WeekDayConstants.MONDAY;
    case 2:
      return WeekDayConstants.TUESDAY;
    case 3:
      return WeekDayConstants.WEDNESDAY;
    case 4:
      return WeekDayConstants.THURSDAY;
    case 5:
      return WeekDayConstants.FRIDAY;
    case 6:
      return WeekDayConstants.SATURDAY;
    default:
      return WeekDayConstants.MONDAY;
  }
}

/**
 * Truncates a date to the specified interval.
 * @param date - The date to truncate.
 * @param interval - The interval to truncate the date to.
 * @param timezone - The timezone to use for truncation (optional).
 * @returns A new `Date` object truncated to the specified interval.
 */
export function truncateDate(
  date: Date,
  interval: DateIntervals,
  timezone?: Timezone,
): Date {
  const originalDate = new Date(date);
  const workingDate =
    timezone !== undefined
      ? new Date(
          originalDate.getTime() + getOffsetForTimezone(originalDate, timezone),
        )
      : originalDate;

  let truncated: Date;
  switch (interval) {
    case DateIntervals.YEAR:
      truncated = new Date(Date.UTC(workingDate.getUTCFullYear()));
      break;
    case DateIntervals.MONTH:
      truncated = new Date(
        Date.UTC(workingDate.getUTCFullYear(), workingDate.getUTCMonth()),
      );
      break;
    case DateIntervals.DAY:
      truncated = new Date(
        Date.UTC(
          workingDate.getUTCFullYear(),
          workingDate.getUTCMonth(),
          workingDate.getUTCDate(),
        ),
      );
      break;
    case DateIntervals.HOUR:
      truncated = new Date(
        Date.UTC(
          workingDate.getUTCFullYear(),
          workingDate.getUTCMonth(),
          workingDate.getUTCDate(),
          workingDate.getUTCHours(),
        ),
      );
      break;
    case DateIntervals.MINUTE:
      truncated = new Date(
        Date.UTC(
          workingDate.getUTCFullYear(),
          workingDate.getUTCMonth(),
          workingDate.getUTCDate(),
          workingDate.getUTCHours(),
          workingDate.getUTCMinutes(),
        ),
      );
      break;
    case DateIntervals.SECOND:
      truncated = new Date(
        Date.UTC(
          workingDate.getUTCFullYear(),
          workingDate.getUTCMonth(),
          workingDate.getUTCDate(),
          workingDate.getUTCHours(),
          workingDate.getUTCMinutes(),
          workingDate.getUTCSeconds(),
        ),
      );
      break;
    case DateIntervals.QUARTER: {
      const month = workingDate.getUTCMonth();
      const quarter = Math.floor(month / 3);
      truncated = new Date(Date.UTC(workingDate.getUTCFullYear(), quarter * 3));
      break;
    }
    case DateIntervals.WEEK:
      truncated = new Date(
        Date.UTC(
          workingDate.getUTCFullYear(),
          workingDate.getUTCMonth(),
          workingDate.getUTCDate() - workingDate.getUTCDay(),
        ),
      );
      break;
    default:
      assertUnreachable(interval);
  }

  if (!timezone) {
    return truncated!;
  }

  const offsetForTruncated = getOffsetForTimezone(truncated!, timezone);
  return new Date(truncated!.getTime() - offsetForTruncated);
}

/**
 * Finds the first interval that overlaps with the given date range.
 * @param intervals - Sorted array of intervals to search, that can't include any overlap.
 * @param startDate - Start date of the range.
 * @param endDate - End date of the range.
 * @param left - Left index for the binary search (default is 0).
 * @param right - Right index for the binary search (default is intervals.length - 1).
 * @param checkExtremes - Whether to check the extreme intervals before performing binary search (default is false).
 * @returns The first overlapping interval, or null if none found.
 */
export function findFirstOverlappingInterval(
  intervals: IntervalLike[],
  startDate: Date,
  endDate: Date,
  left: number = 0,
  right: number = intervals.length - 1,
  checkExtremes: boolean = false,
): { interval: IntervalLike; index: number } | null {
  if (intervals.length === 0) {
    return null;
  }

  if (left > right) {
    return null;
  }

  const first = intervals[left];
  const last = intervals[right];

  if (endDate <= first.start || startDate >= last.end) {
    return null;
  }
  if (checkExtremes) {
    if (first.start < endDate && first.end > startDate) {
      return { interval: first, index: left };
    }
    if (last.start < endDate && last.end > startDate) {
      return { interval: last, index: right };
    }
    if (left + 1 > right - 1) {
      return null;
    }
    left += 1;
    right -= 1;
  }
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const interval = intervals[mid];

    if (interval.start >= endDate) {
      right = mid - 1;
      continue;
    }

    if (interval.end <= startDate) {
      left = mid + 1;
      continue;
    }

    return { interval, index: mid };
  }

  return null;
}

/**
 * Utility class for date-related operations.
 * This class provides export function methods for manipulating dates.
 */
export const DateUtils = {
  addDaysToDate,
  addHoursToDate,
  addMinutesToDate,
  addMonthsToDate,
  addMsToDate,
  addSecondsToDate,
  addYearsToDate,
  getOffsetForTimezone,
  getWeekDayFromDate,
  truncateDate,
  findFirstOverlappingInterval,
};

export default DateUtils;

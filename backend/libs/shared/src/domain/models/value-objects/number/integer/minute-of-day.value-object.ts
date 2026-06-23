import { NonNegativeIntegerNumberValueObject } from './non-negative-integer-number.value-object';
import { BadRequestException, HttpException } from '@nestjs/common';
import { MINUTES_PER_DAY } from '@shared/domain/models/constants';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Base value object representing minutes elapsed since midnight.
 */
export abstract class MinuteOfDayValueObject extends NonNegativeIntegerNumberValueObject {
  /**
   * @param value Minutes since midnight.
   */
  protected constructor(value: number) {
    super(value);
    this.ensureNotExceedingDay(value);
  }

  /**
   * Ensures the minute value does not exceed the number of minutes in a day.
   * @param value Minutes since midnight.
   */
  private ensureNotExceedingDay(value: number): void {
    if (value > MINUTES_PER_DAY) {
      throw this.greaterThanMinutesPerDayException();
    }
  }

  /**
   * Exception thrown when the value exceeds the total minutes in a day.
   */
  protected abstract greaterThanMinutesPerDayException(): HttpException;

  /**
   * {@inheritDoc}
   */
  override nonIntegerException(): HttpException {
    return new BadRequestException(
      SharedErrorMessagesConstants.MINUTE_OF_DAY_MUST_BE_INTEGER,
    );
  }

  /**
   * {@inheritDoc}
   */
  override negativeException(): HttpException {
    return new BadRequestException(
      SharedErrorMessagesConstants.MINUTE_OF_DAY_CANNOT_BE_NEGATIVE,
    );
  }
}

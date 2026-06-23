import { MinuteOfDayValueObject } from './minute-of-day.value-object';
import { BadRequestException, HttpException } from '@nestjs/common';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Represents the ending minute of the day for an availability slot.
 */
export class EndMinuteOfDay extends MinuteOfDayValueObject {
  /**
   * @param value Minutes since midnight marking the end of the slot.
   */
  constructor(value: number) {
    super(value);
  }

  /**
   * Exception thrown when the value exceeds the total minutes in a day.
   */
  protected greaterThanMinutesPerDayException(): HttpException {
    return new BadRequestException(
      SharedErrorMessagesConstants.MINUTE_OF_DAY_CANNOT_EXCEED_DAY,
    );
  }
}

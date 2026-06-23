import { PositiveIntegerNumberValueObject } from './positive-integer-number.value-object';
import { BadRequestException } from '@nestjs/common';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Represents a limit value object that must be a positive integer.
 */
export class LimitValueObject extends PositiveIntegerNumberValueObject {
  /**
   *  Creates an instance of LimitValueObject.
   * @param value - The limit number, which must be a positive integer.
   */
  constructor(value: number) {
    super(value);
  }
  /**
   * Creates an instance of LimitNotIntegerException.
   * @returns An instance of LimitValueObject.
   */
  nonIntegerException() {
    return new BadRequestException(
      SharedErrorMessagesConstants.LIMIT_MUST_BE_INTEGER,
    );
  }

  /**
   * Creates an instance of LimitNotIntegerException.
   * @returns An instance of LimitNotIntegerException.
   */
  nonPositiveException() {
    return new BadRequestException(
      SharedErrorMessagesConstants.LIMIT_MUST_BE_POSITIVE,
    );
  }
}

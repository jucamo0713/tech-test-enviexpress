import { PositiveIntegerNumberValueObject } from './positive-integer-number.value-object';
import { BadRequestException } from '@nestjs/common';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Represents a page value object that must be a positive integer.
 */
export class PageValueObject extends PositiveIntegerNumberValueObject {
  /**
   *  Creates an instance of PageValueObject.
   * @param value - The page number, which must be a positive integer.
   */
  constructor(value: number) {
    super(value);
  }
  /**
   * Creates an instance of PageNotIntegerException.
   * @returns An instance of PageValueObject.
   */
  nonIntegerException() {
    return new BadRequestException(
      SharedErrorMessagesConstants.PAGE_MUST_BE_INTEGER,
    );
  }

  /**
   * Creates an instance of PageNotIntegerException.
   * @returns An instance of PageNotIntegerException.
   */
  nonPositiveException() {
    return new BadRequestException(
      SharedErrorMessagesConstants.PAGE_MUST_BE_POSITIVE,
    );
  }
}

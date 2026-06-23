import { BadRequestException } from '@nestjs/common';

import { ValidatableStringValueObject } from './validatable-string.value-object';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Class representing an email value object.
 */
export class Email extends ValidatableStringValueObject {
  private static readonly regexp: RegExp = new RegExp(
    /^(([^<>()[\]\\.,;:\s@+"]+(\.[^<>()[\]\\.,;:\s+@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );

  /**
   * @param value The value to be assigned to the email value object.
   */
  constructor(value: string) {
    super(value.trim().toLowerCase());
  }

  /**
   * Performs strict validation of the email address and throws an exception if not valid.
   * @param value - The email address to be strictly validated.
   * @throws {BadRequestException} Thrown if the email address is not valid.
   */
  protected validate(value: string): void {
    if (!Email.regexp.test(value)) {
      throw new BadRequestException(SharedErrorMessagesConstants.INVALID_EMAIL);
    }
  }
}

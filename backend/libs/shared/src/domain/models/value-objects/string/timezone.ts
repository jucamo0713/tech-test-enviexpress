import { ValidatableStringValueObject } from './validatable-string.value-object';
import { BadRequestException } from '@nestjs/common';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * A value object that represents a valid IANA timezone.
 */
export class Timezone extends ValidatableStringValueObject {
  static get UTC(): Timezone {
    return new Timezone('UTC');
  }

  /**
   * @param value The timezone value.
   * @throws {Error} If the timezone is invalid.
   */
  constructor(value: string) {
    super(value);
  }

  /**
   * Validates if the provided value is a valid IANA timezone.
   * @param value The raw timezone value.
   * @throws {Error} If the timezone is not valid.
   */
  protected validate(value: string): void {
    if (!Timezone.isValidTimezone(value)) {
      throw new BadRequestException(
        SharedErrorMessagesConstants.INVALID_TIMEZONE,
      );
    }
  }

  /**
   * Checks if a given string is a valid IANA timezone.
   * @param timezone The timezone string to validate.
   * @returns True if valid, false otherwise.
   */
  public static isValidTimezone(timezone: string): boolean {
    try {
      return (
        Intl.DateTimeFormat(undefined, { timeZone: timezone }) !== undefined
      );
    } catch {
      return false;
    }
  }
}

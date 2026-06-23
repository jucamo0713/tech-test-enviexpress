import { ValidatableSingletonValueObject } from './validatable-singleton.value-object';
import { BadRequestException } from '@nestjs/common';
import { LangIsoCodeConstants } from '@shared/domain/models/constants';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Represents the value object of a language code in the
 * Iso 2 code standard.
 */
export class LangIsoCode extends ValidatableSingletonValueObject {
  static {
    for (const i in LangIsoCodeConstants) {
      this.getInstance(i);
    }
  }
  /**
   * @param value The raw value.
   */
  constructor(value: string) {
    const lang = LangIsoCode.isValid(value)
      ? value.toLowerCase()
      : LangIsoCodeConstants.en;
    super(lang);
  }

  /**
   *
   * @param value
   */
  validate(value: string): void {
    if (!LangIsoCode.isValid(value)) {
      throw new BadRequestException(
        SharedErrorMessagesConstants.INVALID_LANG_ISO_CODE,
      );
    }
  }
  /**
   * Validates whether the language code is valid or not.
   * @param value - The value to validate.
   * @returns `true` if the status is valid, otherwise `false`.
   */
  static isValid(value: string): boolean {
    return value.toLowerCase() in LangIsoCodeConstants;
  }
}

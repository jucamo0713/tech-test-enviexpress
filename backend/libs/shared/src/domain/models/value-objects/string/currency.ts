import { ValidatableSingletonValueObject } from './validatable-singleton.value-object';
import { BadRequestException } from '@nestjs/common';
import { CurrencyConstants } from '@shared/domain/models/constants';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';

/**
 * Represents the value object of a currency code in the ISO 4217 standard.
 */
export class Currency extends ValidatableSingletonValueObject {
  static {
    for (const code in CurrencyConstants) {
      this.getInstance(code);
    }
  }

  /**
   * @param value The raw value to wrap.
   */
  constructor(value: string) {
    const currency = Currency.isValid(value)
      ? value.toUpperCase()
      : CurrencyConstants.USD;
    super(currency);
  }

  /**
   * Validates whether the provided value represents a supported currency code.
   * @param value The value to validate.
   */
  validate(value: string): void {
    if (!Currency.isValid(value)) {
      throw new BadRequestException(
        SharedErrorMessagesConstants.INVALID_CURRENCY_CODE,
      );
    }
  }

  /**
   * Checks if the provided currency code is valid.
   * @param value The value to validate.
   * @returns `true` when the code belongs to {@link CurrencyConstants}.
   */
  static isValid(value: string): boolean {
    if (!value) {
      return false;
    }
    return value.toUpperCase() in CurrencyConstants;
  }
}

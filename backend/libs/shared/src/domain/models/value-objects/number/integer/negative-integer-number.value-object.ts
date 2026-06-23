import { isNegative } from 'class-validator';
import { ValidatableIntegerNumberValueObject } from './validatable-integer-number.value-object';
import { HttpException } from '@nestjs/common';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class NegativeIntegerNumberValueObject extends ValidatableIntegerNumberValueObject {
  /**
   * Validates that the given value is a negative number.
   * @param value - The value to be validated.
   */
  validate(value: number) {
    if (!isNegative(value)) {
      throw this.nonNegativeException();
    }
  }

  abstract nonNegativeException(): HttpException;
}

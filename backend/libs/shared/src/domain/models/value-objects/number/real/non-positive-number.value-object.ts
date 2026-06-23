import { ValidatableNumberValueObject } from './validatable-number.value-object';
import { HttpException } from '@nestjs/common';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class NonPositiveNumberValueObject extends ValidatableNumberValueObject {
  /**
   * Validates that the number is non-positive (i.e., less than or equal to zero).
   * @param value - The number to validate.
   * @throws {HttpException} - Throws an exception if the number is positive.
   */
  validate(value: number) {
    if (value > 0) {
      throw this.positiveException();
    }
  }

  abstract positiveException(): HttpException;
}

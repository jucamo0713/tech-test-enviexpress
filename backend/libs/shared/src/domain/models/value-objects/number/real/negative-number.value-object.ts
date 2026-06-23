import { isNegative } from 'class-validator';
import { HttpException } from '@nestjs/common';
import { ValidatableNumberValueObject } from './validatable-number.value-object';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class NegativeNumberValueObject extends ValidatableNumberValueObject {
  /**
   * Validates that the given value is a negative number.
   * @param value - The value to be validated.
   * @throws {HttpException} - Throws an exception if the value is not negative.
   */
  validate(value: number) {
    if (!isNegative(value)) {
      throw this.nonNegativeException();
    }
  }

  abstract nonNegativeException(): HttpException;
}

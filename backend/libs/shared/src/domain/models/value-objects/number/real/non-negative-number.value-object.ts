import { ValidatableNumberValueObject } from './validatable-number.value-object';
import { HttpException } from '@nestjs/common';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class NonNegativeNumberValueObject extends ValidatableNumberValueObject {
  /**
   * Constructor for the NonNegativeNumberValueObject class.
   * @param value - The value to be validated and set.
   * @throws HttpException an exception if the value is negative.
   */
  validate(value: number) {
    if (value < 0) {
      throw this.negativeException();
    }
  }

  abstract negativeException(): HttpException;
}

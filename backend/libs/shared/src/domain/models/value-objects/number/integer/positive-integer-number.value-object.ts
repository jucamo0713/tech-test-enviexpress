import { isPositive } from 'class-validator';
import { ValidatableIntegerNumberValueObject } from './validatable-integer-number.value-object';
import { HttpException } from '@nestjs/common';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class PositiveIntegerNumberValueObject extends ValidatableIntegerNumberValueObject {
  /**
   * Constructor for the PositiveNumberValueObject class.
   * @param value - The value to be validated and set.
   * @throws {HttpException} - Throws an exception if the value is not positive.
   */
  validate(value: number) {
    if (!isPositive(value)) {
      throw this.nonPositiveException();
    }
  }

  abstract nonPositiveException(): HttpException;
}

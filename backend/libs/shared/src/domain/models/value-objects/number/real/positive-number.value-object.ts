import { isPositive } from 'class-validator';
import { ValidatableNumberValueObject } from './validatable-number.value-object';
import { HttpException } from '@nestjs/common';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class PositiveNumberValueObject extends ValidatableNumberValueObject {
  /**
   * Creates a new instance of PositiveNumberValueObject.
   * @param value - The value to validate and store.
   */
  protected constructor(value: number) {
    super(value);
  }

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

  /**
   * Abstract method to throw a non-positive exception.
   * @returns {HttpException} - Throws an exception if the number is not positive.
   */
  abstract nonPositiveException(): HttpException;
}

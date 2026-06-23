import { isInt } from 'class-validator';
import { HttpException } from '@nestjs/common';
import { NumberValueObject } from '../real';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class IntegerNumberValueObject extends NumberValueObject {
  /**
   * Constructor for the IntegerNumberValueObject class.
   * @param value - The value to be validated and set.
   */
  protected constructor(value: number) {
    super(value);
    this.validateInteger(value);
  }

  /**
   * Constructor for the IntegerNumberValueObject class.
   * @param value - The value to be validated and set.
   * @throws HttpException - Throws an exception if the value is not a positive integer.
   */
  validateInteger(value: number) {
    if (!isInt(value)) {
      throw this.nonIntegerException();
    }
  }

  abstract nonIntegerException(): HttpException;
}

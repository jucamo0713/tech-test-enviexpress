import { NumberValueObject } from './number.value-object';

/**
 * Abstract class representing a validatable number value object.
 */
export abstract class ValidatableNumberValueObject extends NumberValueObject {
  /**
   * Creates an instance of NumberValueObject.
   * @param value - The number value.
   */
  protected constructor(value: number) {
    super(value);
    this.validate(value);
  }

  /**
   * Validates the number value.
   * @param value - The number value to validate.
   */
  abstract validate(value: number): void;
}

import { StringValueObject } from './string.value-object';

/**
 * A value object that represents objects whose structure can be verified in some way.
 */
export abstract class ValidatableStringValueObject extends StringValueObject {
  /**
   * @param value The raw value.
   */
  protected constructor(value: string) {
    super(value);
    this.validate(value);
  }

  /**
   * Validates if the provided value is valid.
   * @param {string} value The raw value.
   */
  protected abstract validate(value: string): void;
}

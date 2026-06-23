import { StringValueObject } from './string.value-object';

/**
 * Class representing an email value object.
 */
export class Cellphone extends StringValueObject {
  /**
   * @param value The value to be assigned to the email value object.
   */
  constructor(value: string) {
    super(value.trim());
  }
}

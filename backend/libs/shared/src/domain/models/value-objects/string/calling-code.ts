import { StringValueObject } from './string.value-object';

/**
 * Value object representing a calling code
 */
export class CallingCode extends StringValueObject {
  /**
   * In the constructor, if the value sent contains the "+"
   * character, it is eliminated.
   * @param value The phone calling code.
   */
  constructor(value: string) {
    super(value.replace('+', ''));
  }
}

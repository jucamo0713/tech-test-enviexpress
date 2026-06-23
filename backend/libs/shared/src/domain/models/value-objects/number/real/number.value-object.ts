/**
 * NumberValueObject is an abstract class that represents a value object
 * for a number. It encapsulates a numeric value and provides methods to
 * interact with it.
 */
export abstract class NumberValueObject {
  /**
   * The value of the number.
   */
  private readonly value: number;

  /**
   * Creates an instance of NumberValueObject.
   * @param value - The number value.
   */
  protected constructor(value: number) {
    this.value = value;
  }

  /**
   * Returns the value of the number.
   * @returns The number value.
   */
  public toNumber(): number {
    return this.value;
  }
}

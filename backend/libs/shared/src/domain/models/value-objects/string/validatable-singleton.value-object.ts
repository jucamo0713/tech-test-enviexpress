import { ValidatableStringValueObject } from './validatable-string.value-object';

type ValueObjectConstructor<T> = {
  readonly name: string;
  new (value: string): T;
};

/**
 * Abstract class representing a validatable singleton value object.
 *
 * This class ensures that only one instance of a given value is created for each specific type,
 * promoting memory efficiency and maintaining the integrity of the value across the application.
 */
export abstract class ValidatableSingletonValueObject extends ValidatableStringValueObject {
  private static readonly instances = new Map<
    string,
    Map<string, ValidatableSingletonValueObject>
  >();

  /**
   * Creates an instance of a validatable singleton value object.
   * @param value The raw value for the singleton object.
   */
  protected constructor(value: string) {
    super(value);
  }

  /**
   * Retrieves the singleton instance of the value object for the specified value.
   * If an instance does not exist, a new instance will be created and cached.
   * @param value The raw value for which to get the singleton instance.
   * @returns The singleton instance of the validatable singleton value object.
   */
  public static getInstance<T extends ValidatableSingletonValueObject>(
    this: ValueObjectConstructor<T>,
    value: string,
  ): T {
    const className = this.name;
    const map = ValidatableSingletonValueObject.instances.get(className);
    if (map) {
      const existing = map.get(value) as T | undefined;
      if (existing) {
        return existing;
      }
      const created = new this(value);
      map.set(value, created);
      return created;
    } else {
      const response = new this(value);
      ValidatableSingletonValueObject.instances.set(
        className,
        new Map([[value, response]]),
      );
      return response;
    }
  }
}

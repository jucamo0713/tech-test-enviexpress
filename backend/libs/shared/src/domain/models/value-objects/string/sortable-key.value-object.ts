import { ValidatableStringValueObject } from './validatable-string.value-object';

/**
 * Abstract base class for sortable key value objects.
 */
export abstract class SortableKey extends ValidatableStringValueObject {
  protected constructor(value: string) {
    super(value);
  }
}

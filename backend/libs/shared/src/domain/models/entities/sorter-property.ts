import {
  SortableKey,
  SortValues,
} from '@shared/domain/models/value-objects/string';

/**
 * Represents a sortable property with a key and direction.
 */
export class SorterProperty<T extends SortableKey> {
  public readonly key: T;
  public readonly value: SortValues;

  constructor(key: T, value: SortValues) {
    this.key = key;
    this.value = value;
  }
}

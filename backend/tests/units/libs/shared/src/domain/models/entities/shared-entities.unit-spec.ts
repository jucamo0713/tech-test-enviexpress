import { Pagination, SorterProperty } from '@shared/domain/models/entities';
import { SortValues } from '@shared/domain/models/value-objects/string/sort-values';
import { SortableKey } from '@shared/domain/models/value-objects/string/sortable-key.value-object';

class TestSortableKey extends SortableKey {
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value) {
      throw new Error('Invalid sortable key');
    }
  }
}

describe('Shared entities', () => {
  describe('Pagination', () => {
    describe('constructor', () => {
      it('should create pagination metadata from pagination params', () => {
        const pagination = new Pagination(['one', 'two'], 2, 10, 25);

        expect(pagination.data).toEqual(['one', 'two']);
        expect(pagination.metadata).toEqual({
          page: 2,
          limit: 10,
          totalPages: 3,
          totalItems: 25,
        });
      });

      it('should apply empty defaults when params are not provided', () => {
        const pagination = new Pagination();

        expect(pagination.data).toEqual([]);
        expect(pagination.metadata).toEqual({
          page: 0,
          limit: 0,
          totalPages: 0,
          totalItems: 0,
        });
      });
    });
  });

  describe('SorterProperty', () => {
    describe('constructor', () => {
      it('should store the sortable key and sort value', () => {
        const key: TestSortableKey = new TestSortableKey('name');
        const value = SortValues.getInstance('ASC');

        const sorter = new SorterProperty(key, value);

        expect(sorter.key).toBe(key);
        expect(sorter.value).toBe(value);
      });
    });
  });
});

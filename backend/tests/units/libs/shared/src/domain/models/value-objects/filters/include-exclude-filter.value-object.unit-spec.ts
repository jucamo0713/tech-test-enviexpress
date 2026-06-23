import { IncludeExcludeFilter } from '@shared/domain/models/value-objects/filters/include-exclude-filter.value-object';

describe('IncludeExcludeFilter', () => {
  describe('constructor', () => {
    it('should keep include and exclude values when provided', () => {
      const filter = new IncludeExcludeFilter<string>({
        include: ['a'],
        exclude: ['b'],
      });

      expect(filter.getInclude()).toEqual(['a']);
      expect(filter.getExclude()).toEqual(['b']);
      expect(filter.isEmpty()).toBe(false);
    });

    it('should be empty when no values are provided', () => {
      const filter = new IncludeExcludeFilter<string>();

      expect(filter.getInclude()).toBeUndefined();
      expect(filter.getExclude()).toBeUndefined();
      expect(filter.isEmpty()).toBe(true);
    });
  });

  describe('fromInclude', () => {
    it('should create a filter with include values', () => {
      const filter = IncludeExcludeFilter.fromInclude(['a']);

      expect(filter.getInclude()).toEqual(['a']);
      expect(filter.getExclude()).toBeUndefined();
    });
  });

  describe('fromExclude', () => {
    it('should create a filter with exclude values', () => {
      const filter = IncludeExcludeFilter.fromExclude(['a']);

      expect(filter.getInclude()).toBeUndefined();
      expect(filter.getExclude()).toEqual(['a']);
    });
  });
});

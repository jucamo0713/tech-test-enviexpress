import { TypeParseUtils } from '@shared/domain/use-cases/utils';

describe('TypeParseUtils', () => {
  describe('valueToBoolean', () => {
    it('should parse boolean-like values', () => {
      expect(TypeParseUtils.valueToBoolean(true)).toBe(true);
      expect(TypeParseUtils.valueToBoolean('yes')).toBe(true);
      expect(TypeParseUtils.valueToBoolean('0')).toBe(false);
      expect(TypeParseUtils.valueToBoolean('unknown')).toBeUndefined();
    });
  });

  describe('valueToAnyArray', () => {
    it('should map comma separated values into an array', () => {
      const result = TypeParseUtils.valueToAnyArray('1,2,3', (item) =>
        Number(item),
      );

      expect(result).toEqual([1, 2, 3]);
    });

    it('should report failed mappings when onFailure is provided', () => {
      const onFailure = jest.fn();
      const result = TypeParseUtils.valueToAnyArray(
        ['valid', null],
        (item) => (typeof item === 'string' ? item : undefined),
        { onFailure },
      );

      expect(result).toEqual(['valid']);
      expect(onFailure).toHaveBeenCalledWith(null);
    });
  });

  describe('valueToTrimmedStringArray', () => {
    it('should trim primitive values and remove empty values', () => {
      const result = TypeParseUtils.valueToTrimmedStringArray([
        ' one ',
        2,
        true,
        '',
        {},
      ]);

      expect(result).toEqual(['one', '2', 'true']);
    });
  });
});

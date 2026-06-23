import { transformBooleanQueryParam } from '@shared/domain/use-cases/utils';

describe('transformBooleanQueryParam', () => {
  describe('parse', () => {
    it('should return the parsed boolean value', () => {
      expect(transformBooleanQueryParam('true', false)).toBe(true);
      expect(transformBooleanQueryParam('off', true)).toBe(false);
    });

    it('should return the default value when the value is not parseable', () => {
      expect(transformBooleanQueryParam(undefined, true)).toBe(true);
      expect(transformBooleanQueryParam('invalid', false)).toBe(false);
    });
  });
});

import { CryptoUtils } from '@shared/domain/use-cases/utils';

describe('CryptoUtils', () => {
  describe('strongHash', () => {
    it('should create a hash that can be verified with the same value and pseudo salt', async () => {
      const hash = await CryptoUtils.strongHash('secret', 'salt');

      await expect(
        CryptoUtils.compareStrongHash(hash, 'secret', 'salt'),
      ).resolves.toBe(true);
    });
  });

  describe('compareStrongHash', () => {
    it('should reject different values', async () => {
      const hash = await CryptoUtils.strongHash('secret');

      await expect(CryptoUtils.compareStrongHash(hash, 'other')).resolves.toBe(
        false,
      );
    });
  });
});

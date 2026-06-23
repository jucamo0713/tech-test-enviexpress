import { hash, verify, argon2id } from 'argon2';

/**
 * Utility class for cryptographic operations.
 */
export class CryptoUtils {
  /**
   * Generates a strong hash of the provided value combined with optional pseudo-salt values using Argon2.
   * @param value - The string value to be hashed.
   * @param pseudoSalt - Optional pseudo-salt values to be appended to the value before hashing. Multiple pseudo-salt strings can be provided.
   * @returns A promise that resolves to the resulting strong hash as a string.
   */
  static strongHash(value: string, ...pseudoSalt: string[]): Promise<string> {
    return hash(value + pseudoSalt.join(''), {
      type: argon2id,
    });
  }

  /**
   * Compares a strong hash with a value combined with optional pseudo-salt values using Argon2.
   * @param hash - The strong hash to compare against.
   * @param value - The string value to be compared.
   * @param pseudoSalt - Optional pseudo-salt values to be appended to the value before comparison. Multiple pseudo-salt strings can be provided.
   * @returns A promise that resolves to a boolean indicating whether the hash matches the value.
   */
  static compareStrongHash(
    hash: string,
    value: string,
    ...pseudoSalt: string[]
  ): Promise<boolean> {
    return verify(hash, value + pseudoSalt.join(''));
  }
}

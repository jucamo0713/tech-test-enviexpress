import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '@shared/domain/models/gateways/token.repository';
import { PrimitiveObject } from '@shared/domain/models/types/primitive.type';

/**
 * Implementation of the `TokenRepository` interface using JWT (JSON Web Token).
 * This class provides methods to sign and verify JWT tokens.
 */
export class JwtTokenRepository implements TokenRepository {
  /**
   * @param jwt - An instance of `JwtService` used to handle JWT operations such as signing and verification.
   */
  constructor(private readonly jwt: JwtService) {}

  /**
   * Signs a payload and generates a JWT token.
   * @param payload - The payload to be signed. This is a generic type that extends `Record<string, unknown>`.
   * @param secret - The secret key used to sign the token.
   * @param expiresIn - The expiration time for the token, in seconds.
   * @returns A string representing the signed JWT token.
   */
  sign<T extends PrimitiveObject>(
    payload: T,
    secret: string,
    expiresIn: number,
  ): string {
    return this.jwt.sign(payload, {
      expiresIn,
      secret,
    });
  }

  /**
   * Verifies a JWT token and returns the decoded payload if valid.
   * @param token - The JWT token to be verified.
   * @param secret - The secret key used to verify the token.
   * @returns The decoded payload as an object of type `T`, or `undefined` if verification fails.
   */
  verify<T extends PrimitiveObject>(
    token: string,
    secret: string,
  ): T | undefined {
    try {
      return this.jwt.verify<T>(token, { secret });
    } catch {
      return undefined;
    }
  }
}

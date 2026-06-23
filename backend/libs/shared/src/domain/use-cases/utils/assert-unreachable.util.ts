import { InternalServerErrorException } from '@nestjs/common';

/**
 * this function allow throw exception when receive an unexpected error
 * @param x the value.
 * @throws {InternalServerErrorException} when is called with a value.
 */
export function assertUnreachable(x: never): never {
  throw new InternalServerErrorException(
    `Not expected value ${JSON.stringify(x)}`,
  );
}

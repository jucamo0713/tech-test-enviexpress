import { StringValueObject } from './string.value-object';
import { v4 as uuid } from 'uuid';
import { Type } from '@nestjs/common';

/**
 * Abstract base class for representing ID value objects, extending the StringValueObject class.
 */
export abstract class IdValueObject extends StringValueObject {
  /**
   * Generates an id with the uuid structure.
   * @returns The generated id.
   */
  static generate(): string {
    return uuid();
  }

  /**
   * Constructor for the IdValueObject class.
   * Generates an instance of the IdValueObject class.
   * @returns The generated instance.
   */
  static generateInstance<T extends IdValueObject>(this: Type<T>): T {
    return new this(IdValueObject.generate());
  }
}

import { BadRequestException, Type } from '@nestjs/common';

import { ValidatableSingletonValueObject } from './validatable-singleton.value-object';
import { SortValuesConstants } from '@shared/domain/models/constants';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';
import { assertUnreachable } from '@shared/domain/use-cases/utils/assert-unreachable.util';

/**
 * Represents a validatable singleton value object for sort directions.
 */
export class SortValues extends ValidatableSingletonValueObject {
  static {
    Object.values(SortValuesConstants).forEach((value) => {
      this.getInstance(value);
    });
  }

  constructor(value: string) {
    super(SortValues.normalize(value));
  }

  public static override getInstance<T extends ValidatableSingletonValueObject>(
    this: Type<T>,
    value: string,
  ): T {
    return super.getInstance.call(this, SortValues.normalize(value)) as T;
  }

  protected validate(value: string): void {
    if (!SortValues.isValid(value)) {
      throw new BadRequestException(
        SharedErrorMessagesConstants.INVALID_SORT_VALUE,
      );
    }
  }

  public static isValid(value: string): boolean {
    if (!value) {
      return false;
    }
    const normalizedValue = SortValues.normalize(value);
    return Object.values(SortValuesConstants).includes(
      normalizedValue as SortValuesConstants,
    );
  }

  public toSortNumber(): 1 | -1 {
    const value = this.toString() as SortValuesConstants;
    switch (value) {
      case SortValuesConstants.ASC:
        return 1;
      case SortValuesConstants.DESC:
        return -1;
      default:
        return assertUnreachable(value);
    }
  }

  private static normalize(value: string): string {
    return value.trim().toUpperCase();
  }
}

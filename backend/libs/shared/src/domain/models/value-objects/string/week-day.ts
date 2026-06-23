import { BadRequestException, Type } from '@nestjs/common';
import { WeekDayConstants } from '@shared/domain/models/constants';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants';
import { ValidatableSingletonValueObject } from './validatable-singleton.value-object';

/**
 * Represents the value object for the days of the week.
 */
export class WeekDay extends ValidatableSingletonValueObject {
  static {
    Object.values(WeekDayConstants).forEach((day) => {
      this.getInstance(day);
    });
  }

  /**
   * @param value The raw value to wrap.
   */
  constructor(value: string) {
    super(WeekDay.normalize(value));
  }

  /**
   * Retrieves the singleton instance for the provided value.
   * @param value The raw value.
   */
  public static override getInstance<T extends ValidatableSingletonValueObject>(
    this: Type<T>,
    value: string,
  ): T {
    return super.getInstance.call(this, WeekDay.normalize(value)) as T;
  }

  /**
   * Validates whether the provided value represents a supported week day.
   * @param value The value to validate.
   */
  protected validate(value: string): void {
    if (!WeekDay.isValid(value)) {
      throw new BadRequestException(
        SharedErrorMessagesConstants.INVALID_WEEK_DAY,
      );
    }
  }

  /**
   * Checks if the provided value is a valid week day.
   * @param value The raw value.
   * @returns `true` when the value matches {@link WeekDayConstants}.
   */
  public static isValid(value: string): boolean {
    const normalizedValue = WeekDay.normalize(value);
    return Object.values(WeekDayConstants).includes(
      normalizedValue as WeekDayConstants,
    );
  }

  private static normalize(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    return value.trim().toUpperCase();
  }
}

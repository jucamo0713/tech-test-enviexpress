import { TypeParseUtils } from './type-parse.utils';

export const transformBooleanQueryParam = (
  value: unknown,
  defaultValue: boolean,
): boolean => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const parsedValue = TypeParseUtils.valueToBoolean(value);
  return parsedValue === undefined ? defaultValue : parsedValue;
};

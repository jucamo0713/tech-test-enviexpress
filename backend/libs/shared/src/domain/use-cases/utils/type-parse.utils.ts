/**
 * Function to convert a value to a boolean.
 * @param value - The value to convert.
 * @returns The boolean representation of the value, or undefined if the conversion is not possible.
 * @example
 * const result: boolean = valueToBoolean('true'); // true
 */
function valueToBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
      return true;
    }
    if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
      return false;
    }
  }
  return undefined;
}

/**
 * Function to convert a value to an array using a custom mapper.
 * @param value - The value to convert.
 * @param mapValue - Mapper for each array item.
 * @param options - Optional callbacks for failed mappings. When onFailure is provided, mapping errors are caught
 * and undefined mappings are reported so the item can be dropped; without it, errors are re-thrown to the caller.
 * @returns The array representation of the value, or undefined if the conversion is not possible.
 * @example
 * const result: string[] = valueToAnyArray('a,b', (item) => String(item).trim());
 */
function valueToAnyArray<T>(
  value: unknown,
  mapValue: (item: unknown) => T | undefined,
  options?: {
    onFailure?: (item: unknown, error?: unknown) => void;
  },
): T[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  let items: unknown[] | undefined;
  if (Array.isArray(value)) {
    items = value as unknown[];
  } else if (typeof value === 'string') {
    items = value.split(',');
  }
  if (!items) {
    return undefined;
  }
  return items
    .map((item) => {
      try {
        const mapped = mapValue(item);
        if (mapped === undefined) {
          options?.onFailure?.(item as any);
        }
        return mapped;
      } catch (error) {
        if (options?.onFailure) {
          options.onFailure(item as any, error);
          return undefined;
        }
        throw error;
      }
    })
    .filter((item): item is T => item !== undefined);
}

function valueToTrimmedStringArray(value: unknown): string[] | undefined {
  return valueToAnyArray(value, (item) => {
    if (item === undefined || item === null) {
      return undefined;
    }
    if (
      typeof item !== 'string' &&
      typeof item !== 'number' &&
      typeof item !== 'boolean' &&
      typeof item !== 'bigint'
    ) {
      return undefined;
    }
    const normalized = String(item).trim();
    return normalized.length > 0 ? normalized : undefined;
  });
}

export const TypeParseUtils = {
  valueToBoolean,
  valueToAnyArray,
  valueToTrimmedStringArray,
} as const;

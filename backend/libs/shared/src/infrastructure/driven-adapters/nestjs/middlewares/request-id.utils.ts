import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

function normalizeRequestId(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item) => item.length > 0);
  }

  return undefined;
}

export function resolveRequestId(
  value: string | string[] | undefined,
  generateRequestId: () => string = randomUUID,
): string {
  return normalizeRequestId(value) ?? generateRequestId();
}

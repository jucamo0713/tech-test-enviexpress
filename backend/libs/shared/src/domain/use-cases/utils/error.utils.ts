/**
 * Resolves the error message from the exception.
 * @param exception - The exception to resolve the error message from.
 * @returns The resolved error message.
 */
function resolveErrorMessage(exception: unknown): string {
  let data: Array<string> | string | null = null;
  switch (typeof exception) {
    case 'object':
      if (exception) {
        if ('response' in exception) {
          if (
            exception.response &&
            typeof exception.response === 'object' &&
            'message' in exception.response
          ) {
            data = Array.isArray(exception.response.message)
              ? exception.response.message
              : String(exception.response.message);
          } else {
            data = Array.isArray(exception.response)
              ? exception.response
              : String(exception.response);
          }
        } else if ('message' in exception) {
          data = Array.isArray(exception.message)
            ? exception.message
            : String(exception.message);
        } else {
          data = Array.isArray(exception) ? (exception as string[]) : null;
        }
        if (!data && exception instanceof Error) {
          data = resolveErrorMessage(exception.cause);
        }
      }
      break;
    case 'string':
      return exception;
  }
  if (Array.isArray(data)) {
    return data.join(', ');
  }
  if (typeof data === 'string') {
    return data;
  }
  try {
    return JSON.stringify(exception);
  } catch {
    return String(exception);
  }
}

function describeUnknownError(error: unknown): string {
  if (error === null) {
    return 'null';
  }

  if (Array.isArray(error)) {
    return 'array';
  }

  return typeof error;
}

export const ErrorUtils = {
  resolveErrorMessage,
  describeUnknownError,
} as const;

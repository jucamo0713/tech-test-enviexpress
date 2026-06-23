import { HttpStatus } from '@nestjs/common';

export type ExceptionProtocol = 'http' | 'rpc' | 'redis-pubsub' | 'unknown';

/**
 * Represents the structure of an error response.
 */
export class ExceptionDto {
  /**
   * Indicates whether the response is successful (always false for error responses).
   */
  success: false = false as const;

  /**
   * The timestamp when the error response occurred.
   */
  timestamp: string = '';

  /**
   * The HTTP status code of the error response.
   */
  httpStatusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  /**
   * Transport/protocol where the error was handled.
   */
  protocol: ExceptionProtocol = 'unknown';

  /**
   * The message describing the error.
   */
  message: string = '';
  /**
   * Correlation id of the request.
   */
  requestId: string = '';

  /**
   * The path of the request that caused the error.
   */
  path: string = '';

  /**
   * The HTTP method of the request that caused the error.
   */
  method: string = '';

  /**
   * Async message channel or RPC pattern related to the error.
   */
  pattern?: string;

  /**
   * The path of the request that caused the error.
   */
  location?: string;
}

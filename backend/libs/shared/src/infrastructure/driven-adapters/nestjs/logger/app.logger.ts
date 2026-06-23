import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';

/**
 * Custom logger that automatically includes the request id from the request headers.
 */
@Injectable()
export class AppLogger extends ConsoleLogger {
  /**
   * Logs a message at the 'log' level.
   * @param message - The message to log.
   * @param [context] - The context of the message.
   */
  log(message: string, context?: string) {
    super.log(message, this.formatContextWithRequestId(context));
  }

  /**
   * Logs a message at the 'error' level.
   * @param message - The error message to log.
   * @param [trace] - The stack trace of the error.
   * @param [context] - The context of the message.
   */
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace || this.formatContextWithRequestId(context));
  }

  /**
   * Logs a message at the 'warn' level.
   * @param message - The warning message to log.
   * @param [context] - The context of the message.
   */
  warn(message: string, context?: string) {
    super.warn(message, this.formatContextWithRequestId(context));
  }

  /**
   * Logs a message at the 'debug' level.
   * @param message - The debug message to log.
   * @param [context] - The context of the message.
   */
  debug(message: string, context?: string) {
    super.debug(message, this.formatContextWithRequestId(context));
  }

  /**
   * Logs a message at the 'verbose' level.
   * @param message - The verbose message to log.
   * @param [context] - The context of the message.
   */
  verbose(message: string, context?: string) {
    super.verbose(message, this.formatContextWithRequestId(context));
  }

  /**
   * Formats the context by appending the request id from the request headers.
   * @param [context] - The context to format.
   * @returns The formatted context.
   */
  protected formatContextWithRequestId(context?: string): string | undefined {
    const requestId = AsyncRequestContext.get('requestId');
    if (requestId) {
      return this.context || context
        ? `${context ?? this.context}] [RequestId: ${requestId}`
        : `RequestId: ${requestId}`;
    }
    return this.context || context ? (context ?? this.context) : undefined;
  }
}

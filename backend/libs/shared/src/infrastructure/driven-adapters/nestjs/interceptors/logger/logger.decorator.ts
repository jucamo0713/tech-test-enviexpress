import { applyDecorators, SetMetadata } from '@nestjs/common';
import { LoggerInterceptorConstants } from './logger.interceptor.constants';

/**
 * [printLogs=true] - Flag to enable or disable logging.\
 * [printRequest=true] - Flag to enable or disable logging of the request data.\
 * [printResponse=true] - Flag to enable or disable logging of the response data.
 */
type LoggerDecoratorOptions = {
  printLogs?: boolean;
  printRequest?: boolean;
  printResponse?: boolean;
};

/**
 * Decorator factory function to configure logging behavior on methods. It allows you to control whether the
 * request, response, and general logs should be printed when the method is executed.
 *
 * This decorator uses metadata to signal the logging interceptor which parts of the log should be suppressed
 * or printed, based on the provided options.
 * @param [options] - Configuration options for the logger behavior.
 * @returns Method decorator with the specified logging metadata.
 */
export function LoggerDecorator(
  options: LoggerDecoratorOptions = {},
): MethodDecorator {
  const {
    printRequest = true,
    printResponse = true,
    printLogs = true,
  } = options;
  return applyDecorators(
    SetMetadata(LoggerInterceptorConstants.DONT_PRINT_REQ_KEY, !printRequest),
    SetMetadata(LoggerInterceptorConstants.DONT_PRINT_RES_KEY, !printResponse),
    SetMetadata(LoggerInterceptorConstants.DONT_PRINT_LOGS_KEY, !printLogs),
  );
}

import { applyDecorators, SetMetadata } from '@nestjs/common';
import { TimeoutInterceptorConstants } from './timeout.interceptor.constants';

/**
 * Timeout decorator for handling method call timeouts.
 * @param timeout - Timeout value in milliseconds.
 * @returns The applied decorator.
 */
export function TimeoutDecorator(timeout: number): MethodDecorator {
  return applyDecorators(
    SetMetadata(TimeoutInterceptorConstants.TIMEOUT_METADATA_KEY, timeout),
  );
}

/**
 * Decorator that determines that the timeout interceptor should be ignored.
 * @returns The applied decorator.
 */
export function CancelTimeoutDecorator(): MethodDecorator {
  return applyDecorators(
    SetMetadata(TimeoutInterceptorConstants.CANCEL_TIMEOUT_METADATA_KEY, true),
  );
}

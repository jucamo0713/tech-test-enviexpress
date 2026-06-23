import { Reflector } from '@nestjs/core';
import {
  ArgumentsHost,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { Observable, tap } from 'rxjs';
import { LoggerInterceptorConstants } from './logger.interceptor.constants';
import { Request } from 'express';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import { REQUEST_ID_HEADER } from '@shared/infrastructure/driven-adapters/nestjs/middlewares';

type LoggerRequest = Request<
  Record<string, string>,
  unknown,
  unknown,
  Record<string, unknown>
>;

/**
 * Logger interceptor for handling request and response logging.
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  /**
   * @param reflector The NestJS reflector.
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * Resolves the request data from the given NestJS execution context.
   * @param context - The execution context from NestJS.
   * @returns A promise resolving to the request data.
   * @throws {Error} Throws an error if the context type is not supported.
   */
  static resolveRequests(context: ArgumentsHost): unknown {
    switch (context.getType()) {
      case 'http': {
        const request = context.switchToHttp().getRequest<LoggerRequest>();
        return request.method === 'GET'
          ? { query: request.query }
          : {
              body: request.body,
              query: request.query,
            };
      }
      case 'rpc': {
        const data = context.switchToRpc().getData<unknown>();
        const metadata = context.switchToRpc().getContext<Metadata | undefined>();

        return {
          data,
          metadata: {
            requestId: metadata?.get(REQUEST_ID_HEADER),
          },
        };
      }
      default: {
        throw new Error('Context Not implemented');
      }
    }
  }

  /**
   * Intercepts the execution context and handles request and response logging.
   * @param context - The execution context.
   * @param next - The call handler.
   * @returns An observable of the intercepted values.
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (
      !this.reflector.get(
        LoggerInterceptorConstants.DONT_PRINT_LOGS_KEY,
        context.getHandler(),
      )
    ) {
      const logger: Logger = new Logger(context.getClass().name);
      const printRequest = !this.reflector.get(
        LoggerInterceptorConstants.DONT_PRINT_REQ_KEY,
        context.getHandler(),
      );
      const printResponse = !this.reflector.get(
        LoggerInterceptorConstants.DONT_PRINT_RES_KEY,
        context.getHandler(),
      );
      const request = printRequest
        ? await LoggerInterceptor.resolveRequests(context)
        : undefined;
      const now = Date.now();
      const requestId = AsyncRequestContext.get('requestId');
      logger.log(
        `[${context.getHandler().name}] INIT :: requestId: ${requestId ?? 'undefined'} ${request ? `data: ${JSON.stringify(request)}` : ''}`,
      );
      return next.handle().pipe(
        tap({
          error: () => {
            logger.error(
              `[${context.getHandler().name}] ERROR :: requestId: ${requestId ?? 'undefined'} in: ${Date.now() - now}ms`,
            );
          },
          next: (value: unknown) =>
            logger.log(
              `[${context.getHandler().name}] FINISH :: requestId: ${requestId ?? 'undefined'} in: ${Date.now() - now}ms - ${
                printResponse ? `response: ${JSON.stringify(value)}` : ''
              }`,
            ),
        }),
      );
    } else {
      return next.handle();
    }
  }
}

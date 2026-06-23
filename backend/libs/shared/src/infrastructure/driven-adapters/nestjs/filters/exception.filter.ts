import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as NestExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ExceptionDto } from './exception.dto';
import type { Request, Response } from 'express';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import { ErrorUtils } from '@shared/domain/use-cases/utils';
import { Observable, throwError } from 'rxjs';

/**
 * Message that is thrown by default if there is no exception.
 */
const INTERNAL_SERVER_ERROR: string = 'INTERNAL_SERVER_ERROR';

/**
 * Exception filter for handling NestJS exceptions and providing standardized error response.
 */
@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  private logger: Logger = new Logger(ExceptionFilter.name);

  static toExceptionDto(
    exception: unknown,
    protocol: ExceptionDto['protocol'] = 'unknown',
  ): ExceptionDto {
    const response: ExceptionDto = new ExceptionDto();
    const error = exception instanceof Error ? exception : new Error(String(exception));

    response.timestamp = Date.now().toString();
    response.requestId = AsyncRequestContext.get('requestId') ?? 'undefined';
    response.protocol = protocol;

    if (exception instanceof HttpException) {
      response.httpStatusCode = exception.getStatus();
      response.message = ErrorUtils.resolveErrorMessage(exception);
      response.location = exception.stack;
    } else {
      response.message = ErrorUtils.resolveErrorMessage(error);
      response.httpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      response.location = error.stack;
    }

    if (!response.message) response.message = INTERNAL_SERVER_ERROR;

    return response;
  }

  static toRedisPubSubExceptionDto(
    exception: unknown,
    channel: string,
  ): ExceptionDto {
    const response = ExceptionFilter.toExceptionDto(exception, 'redis-pubsub');
    response.pattern = channel;
    return response;
  }

  /**
   * Handles exceptions caught by NestJS and provides standardized error response.
   * @param exception - The exception caught by NestJS.
   * @param host - The context host of the execution.
   */
  public catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void | Observable<never> {
    this.logger.error(JSON.stringify(exception));
    const hostType = host.getType() as string;
    const response: ExceptionDto = ExceptionFilter.toExceptionDto(
      exception,
      hostType === 'http' || hostType === 'rpc' ? hostType : 'unknown',
    );

    if (exception instanceof HttpException) {
      this.logger.error(
        `[${this.catch.name}] ERROR :: CONTROLLED EXCEPTION OCCURRED `,
      );
    } else {
      this.logger.error(
        `[${this.catch.name}] ERROR :: UNCONTROLLED EXCEPTION OCCURRED`,
      );
    }

    try {
      switch (hostType) {
        case 'http':
          response.path = host.switchToHttp().getRequest<Request>().url;
          response.method = host.switchToHttp().getRequest<Request>().method;
          host
            .switchToHttp()
            .getResponse<Response>()
            .status(response.httpStatusCode)
            .json(response);
          break;
        case 'rpc':
          response.pattern = host.getArgByIndex(2)?.handler?.path;
          return throwError(() => new RpcException(response));
        case 'redis-pubsub':
          return throwError(() => new RpcException(response));
        default:
          throw new InternalServerErrorException(
            `PROTOCOL ${hostType} HAS NOT IMPLEMENTED`,
          );
      }
    } finally {
      this.logger.error(`ERROR :: ${JSON.stringify(response)}`);
    }
  }
}

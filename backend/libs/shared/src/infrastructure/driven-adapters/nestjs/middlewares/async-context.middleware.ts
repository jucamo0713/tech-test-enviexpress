import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import { REQUEST_ID_HEADER, resolveRequestId } from './request-id.utils';

/**
 * Middleware that sets the asynchronous request context for each request.
 */
@Injectable()
export class AsyncContextMiddleware implements NestMiddleware {
  /**
   * Sets the request id in the asynchronous request context.
   * @param req - Incoming HTTP request.
   * @param _ - Outgoing HTTP response.
   * @param next - Function to pass control to the next middleware.
   */
  use(req: Request, _: Response, next: NextFunction): void {
    const requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
    req.headers[REQUEST_ID_HEADER] = requestId;

    AsyncRequestContext.setData(
      {
        requestId,
      },
      next,
    );
  }
}

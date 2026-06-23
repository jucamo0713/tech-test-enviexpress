import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { REQUEST_ID_HEADER, resolveRequestId } from './request-id.utils';

/**
 * Middleware that ensures each request/response has a unique request id in the `x-request-id` header.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * Adds a request id to the request and response headers.
   * @param req - Incoming HTTP request.
   * @param res - Outgoing HTTP response.
   * @param next - Function to pass control to the next middleware.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}

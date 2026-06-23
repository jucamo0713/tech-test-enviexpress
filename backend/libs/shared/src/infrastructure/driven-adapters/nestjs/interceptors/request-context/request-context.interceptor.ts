import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import {
  REQUEST_ID_HEADER,
  resolveRequestId,
} from '@shared/infrastructure/driven-adapters/nestjs/middlewares';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const requestId = this.resolveRequestId(context);

    return new Observable((subscriber) => {
      AsyncRequestContext.setData({ requestId }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }

  private resolveRequestId(context: ExecutionContext): string {
    switch (context.getType()) {
      case 'http': {
        const request = context.switchToHttp().getRequest<{
          headers: Record<string, string | string[] | undefined>;
        }>();
        return resolveRequestId(request.headers[REQUEST_ID_HEADER]);
      }
      case 'rpc': {
        const metadata = context.switchToRpc().getContext<Metadata | undefined>();
        return resolveRequestId(metadata?.get(REQUEST_ID_HEADER) as string[]);
      }
      default: {
        return resolveRequestId(undefined);
      }
    }
  }
}

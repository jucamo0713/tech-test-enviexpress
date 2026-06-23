import { HttpInterceptorFn } from '@angular/common/http';

const REQUEST_ID_HEADER = 'x-request-id';

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export const requestIdInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.headers.has(REQUEST_ID_HEADER)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        [REQUEST_ID_HEADER]: createRequestId(),
      },
    }),
  );
};


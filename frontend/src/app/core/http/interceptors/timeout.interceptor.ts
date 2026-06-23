import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { APP_CONFIG } from '../../config';
import { AppError } from '../../errors';

export const timeoutInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(APP_CONFIG);

  return next(request).pipe(
    timeout(config.requestTimeoutMs),
    catchError((error: unknown) => {
      if (error instanceof TimeoutError) {
        const appError: AppError = {
          kind: 'timeout',
          message: 'Request timeout',
          path: request.urlWithParams,
        };

        return throwError(() => appError);
      }

      return throwError(() => error);
    }),
  );
};


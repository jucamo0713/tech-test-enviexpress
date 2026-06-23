import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';

export const AUTH_TOKEN_READER = new InjectionToken<() => string | null>(
  'AUTH_TOKEN_READER',
  {
    factory: () => () => null,
  },
);

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const readToken = inject(AUTH_TOKEN_READER);
  const token = readToken();

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};


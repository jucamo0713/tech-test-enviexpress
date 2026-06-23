import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { switchMap } from 'rxjs';
import { AuthRefreshService } from '../../../contexts/auth/application/services/auth-refresh.service';
import { AuthSessionService } from '../../../contexts/auth/application/services/auth-session.service';

export const AUTH_TOKEN_READER = new InjectionToken<() => string | null>(
  'AUTH_TOKEN_READER',
  {
    factory: () => () => null,
  },
);

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.includes('/auth/refresh')) {
    return next(request);
  }

  const session = inject(AuthSessionService);
  const refreshService = inject(AuthRefreshService);
  const token = session.accessToken();

  if (!token) {
    return next(request);
  }

  if (session.isAccessTokenAboutToExpire()) {
    return refreshService.refresh().pipe(
      switchMap((auth) => {
        return next(
          request.clone({
            setHeaders: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }),
        );
      }),
    );
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};


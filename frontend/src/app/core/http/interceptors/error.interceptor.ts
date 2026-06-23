import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorMapper } from '../../errors';

export const errorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => throwError(() => ErrorMapper.fromUnknown(error))),
  );


import { isObservable, Observable, of, from } from 'rxjs';
import { AsyncResult } from '../handlers';

export function toObservable<TResult>(
  result: AsyncResult<TResult>,
): Observable<TResult> {
  if (isObservable(result)) {
    return result;
  }

  if (result instanceof Promise) {
    return from(result);
  }

  return of(result);
}


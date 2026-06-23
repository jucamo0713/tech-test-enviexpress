import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Query } from '../queries/query';
import { QUERY_HANDLERS, QueryHandler } from '../handlers';
import { toObservable } from './result.util';

@Injectable({ providedIn: 'root' })
export class QueryBus {
  private readonly handlers = inject(QUERY_HANDLERS, { optional: true });

  execute<TResult>(query: Query<TResult>): Observable<TResult> {
    const handler = this.handlers?.find(
      (candidate) => candidate.queryType === query.type,
    ) as QueryHandler<Query<TResult>, TResult> | undefined;

    if (!handler) {
      return throwError(
        () => new Error(`No query handler registered for ${query.type}`),
      );
    }

    return toObservable(handler.execute(query));
  }
}

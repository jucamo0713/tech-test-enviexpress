import { Query } from '../queries/query';
import { AsyncResult } from './async-result';

export interface QueryHandler<TQuery extends Query<TResult>, TResult> {
  readonly queryType: TQuery['type'];
  execute(query: TQuery): AsyncResult<TResult>;
}


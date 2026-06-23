import { Observable } from 'rxjs';

export type AsyncResult<TResult> = TResult | Promise<TResult> | Observable<TResult>;


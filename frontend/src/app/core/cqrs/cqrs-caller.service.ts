import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Command } from './commands/command';
import { DomainEvent } from './events/domain-event';
import { Query } from './queries/query';
import { CommandBus, EventBus, QueryBus } from './buses';

@Injectable({ providedIn: 'root' })
export class CqrsCallerService {
  private readonly commandBus = inject(CommandBus);
  private readonly queryBus = inject(QueryBus);
  private readonly eventBus = inject(EventBus);

  dispatch<TResult>(command: Command<TResult>): Observable<TResult> {
    return this.commandBus.dispatch(command);
  }

  query<TResult>(query: Query<TResult>): Observable<TResult> {
    return this.queryBus.execute(query);
  }

  emit(event: DomainEvent): Observable<void> {
    return this.eventBus.publish(event);
  }
}

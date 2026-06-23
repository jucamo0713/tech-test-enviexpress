import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { DomainEvent } from '../events/domain-event';
import { EVENT_HANDLERS, EventHandler } from '../handlers';
import { toObservable } from './result.util';

@Injectable({ providedIn: 'root' })
export class EventBus {
  private readonly handlers = inject(EVENT_HANDLERS, { optional: true });

  publish(event: DomainEvent): Observable<void> {
    const handlers =
      this.handlers?.filter((handler) => handler.eventType === event.type) ?? [];

    if (handlers.length === 0) {
      return of(undefined);
    }

    return forkJoin(handlers.map((handler) => toObservable(handler.handle(event)))).pipe(
      map(() => undefined),
    );
  }
}

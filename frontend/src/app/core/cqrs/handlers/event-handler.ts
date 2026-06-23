import { DomainEvent } from '../events/domain-event';
import { AsyncResult } from './async-result';

export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  readonly eventType: TEvent['type'];
  handle(event: TEvent): AsyncResult<void>;
}


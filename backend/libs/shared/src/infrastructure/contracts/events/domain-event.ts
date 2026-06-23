export interface DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: string;
  requestId: string;
  payload: TPayload;
}

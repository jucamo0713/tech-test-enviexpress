import type { DomainEvent } from './domain-event';

export const AUDIT_EVENTS_CHANNEL = 'audit.events';

export interface AuditEventPayload extends Record<string, unknown> {
  eventType: string;
  actorId: string;
  metadata?: unknown;
}

export type AuditEvent = DomainEvent<AuditEventPayload>;

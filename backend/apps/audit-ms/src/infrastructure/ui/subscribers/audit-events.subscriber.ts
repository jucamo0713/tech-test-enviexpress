import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  AUDIT_EVENTS_CHANNEL,
  type AuditEvent,
  type DomainEvent,
  RedisPubSubClient,
} from 'app/shared';
import { CreateAuditRecordUseCase } from '../../../domain/use-cases/create-audit-record.use-case';

@Injectable()
export class AuditEventsSubscriber implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(AuditEventsSubscriber.name);
  private readonly unsubscribers: Array<() => Promise<void>> = [];

  constructor(
    private readonly redisPubSub: RedisPubSubClient,
    private readonly createAuditRecordUseCase: CreateAuditRecordUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    this.unsubscribers.push(
      await this.redisPubSub.subscribe(AUDIT_EVENTS_CHANNEL, (event) =>
        this.persistAuditEvent(event as AuditEvent),
      ),
      await this.redisPubSub.subscribe('package.status.changed', (event) =>
        this.persistPackageStatusChanged(event),
      ),
    );

    this.logger.log(
      `Subscribed to ${AUDIT_EVENTS_CHANNEL} and package.status.changed`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    await Promise.all(this.unsubscribers.map((unsubscribe) => unsubscribe()));
  }

  private async persistAuditEvent(event: AuditEvent): Promise<void> {
    await this.createAuditRecordUseCase.execute({
      entityType: event.aggregateType,
      entityId: event.aggregateId,
      action: event.payload.eventType || event.name,
      actorId: event.payload.actorId || 'system',
      metadata: JSON.stringify({
        eventId: event.id,
        eventName: event.name,
        requestId: event.requestId,
        occurredAt: event.occurredAt,
        metadata: event.payload.metadata ?? {},
      }),
    });
  }

  private async persistPackageStatusChanged(event: DomainEvent): Promise<void> {
    const payload = event.payload;
    await this.createAuditRecordUseCase.execute({
      entityType: event.aggregateType || 'package',
      entityId: event.aggregateId,
      action: event.name,
      actorId: this.toStringValue(payload.changedBy) ?? 'system',
      metadata: JSON.stringify({
        eventId: event.id,
        requestId: event.requestId,
        occurredAt: event.occurredAt,
        payload,
      }),
    });
  }

  private toStringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0
      ? value
      : undefined;
  }
}

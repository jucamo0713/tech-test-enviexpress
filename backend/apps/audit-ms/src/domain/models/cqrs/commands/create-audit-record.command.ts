import { Command } from '@nestjs/cqrs';
import type { AuditRecord } from '../../entities/audit-record';

export class CreateAuditRecordCommand extends Command<AuditRecord> {
  constructor(
    public readonly payload: {
      entityType: string;
      entityId: string;
      action: string;
      actorId: string;
      metadata?: string;
    },
  ) { super(); }
}

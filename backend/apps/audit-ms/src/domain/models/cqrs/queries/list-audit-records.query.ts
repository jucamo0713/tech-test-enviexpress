import { Query } from '@nestjs/cqrs';
import type { AuditRecord } from '../../entities/audit-record';

export class ListAuditRecordsQuery extends Query<AuditRecord[]> {
  constructor(public readonly filter: { entityType?: string; entityId?: string }) {
    super();
  }
}

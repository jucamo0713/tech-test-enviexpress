import { AuditRecordRepository } from '../../infrastructure/driven-adapters/database/audit-record.repository';

export class ListAuditRecordsUseCase {
  constructor(private readonly repository: AuditRecordRepository) {}
  execute(filter: { entityType?: string; entityId?: string }) {
    return this.repository.list(filter);
  }
}

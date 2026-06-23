import { AuditRecordRepository } from '../../infrastructure/driven-adapters/database/audit-record.repository';
import { CreateAuditRecordCommand } from '../models/cqrs/commands/create-audit-record.command';

export class CreateAuditRecordUseCase {
  constructor(private readonly repository: AuditRecordRepository) {}
  execute(payload: CreateAuditRecordCommand['payload']) {
    return this.repository.create(payload);
  }
}

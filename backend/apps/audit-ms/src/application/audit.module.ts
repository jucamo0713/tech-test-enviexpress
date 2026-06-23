import { Module } from '@nestjs/common';
import { SharedModule } from 'app/shared';
import { AuditRecordRepository } from '../infrastructure/driven-adapters/database/audit-record.repository';
import { DatabaseAuditRecordModelProvider } from '../infrastructure/driven-adapters/database/database-audit-record-model.provider';
import { CreateAuditRecordUseCase } from '../domain/use-cases/create-audit-record.use-case';
import { ListAuditRecordsUseCase } from '../domain/use-cases/list-audit-records.use-case';
import { AuditEventsSubscriber } from '../infrastructure/ui/subscribers/audit-events.subscriber';
import {
  CreateAuditRecordCommandHandler,
  ListAuditRecordsQueryHandler,
} from '../infrastructure/ui/cqrs-handlers/audit.handlers';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [
    DatabaseAuditRecordModelProvider,
    AuditRecordRepository,
    {
      provide: CreateAuditRecordUseCase,
      inject: [AuditRecordRepository],
      useFactory: (repository: AuditRecordRepository) =>
        new CreateAuditRecordUseCase(repository),
    },
    {
      provide: ListAuditRecordsUseCase,
      inject: [AuditRecordRepository],
      useFactory: (repository: AuditRecordRepository) =>
        new ListAuditRecordsUseCase(repository),
    },
    CreateAuditRecordCommandHandler,
    ListAuditRecordsQueryHandler,
    AuditEventsSubscriber,
  ],
})
export class AuditModule {}

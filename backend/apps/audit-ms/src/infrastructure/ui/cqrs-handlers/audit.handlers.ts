import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CreateAuditRecordCommand } from '../../../domain/models/cqrs/commands/create-audit-record.command';
import { ListAuditRecordsQuery } from '../../../domain/models/cqrs/queries/list-audit-records.query';
import { CreateAuditRecordUseCase } from '../../../domain/use-cases/create-audit-record.use-case';
import { ListAuditRecordsUseCase } from '../../../domain/use-cases/list-audit-records.use-case';

@CommandHandler(CreateAuditRecordCommand)
export class CreateAuditRecordCommandHandler implements ICommandHandler<CreateAuditRecordCommand> {
  constructor(private readonly useCase: CreateAuditRecordUseCase) {}
  execute(command: CreateAuditRecordCommand) { return this.useCase.execute(command.payload); }
}

@QueryHandler(ListAuditRecordsQuery)
export class ListAuditRecordsQueryHandler implements IQueryHandler<ListAuditRecordsQuery> {
  constructor(private readonly useCase: ListAuditRecordsUseCase) {}
  execute(query: ListAuditRecordsQuery) { return this.useCase.execute(query.filter); }
}

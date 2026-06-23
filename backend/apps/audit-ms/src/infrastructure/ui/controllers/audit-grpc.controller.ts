import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuditProto } from 'app/shared';
import { CreateAuditRecordCommand } from '../../../domain/models/cqrs/commands/create-audit-record.command';
import { ListAuditRecordsQuery } from '../../../domain/models/cqrs/queries/list-audit-records.query';

@Controller()
@AuditProto.AuditServiceControllerMethods()
export class AuditGrpcController implements AuditProto.AuditServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  health(_request: AuditProto.HealthRequest): AuditProto.HealthResponse {
    return { status: 'ok' };
  }

  createAuditRecord(request: AuditProto.CreateAuditRecordRequest) {
    return this.commandBus.execute(new CreateAuditRecordCommand(request));
  }

  async listAuditRecords(request: AuditProto.ListAuditRecordsRequest) {
    return {
      records: await this.queryBus.execute(new ListAuditRecordsQuery(request)),
    };
  }
}

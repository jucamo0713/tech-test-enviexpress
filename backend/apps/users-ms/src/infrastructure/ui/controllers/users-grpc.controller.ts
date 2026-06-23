import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';
import { CreateClientUserCommand } from '../../../domain/models/cqrs/commands/create-client-user.command';
import { CreateOperatorCommand } from '../../../domain/models/cqrs/commands/create-operator.command';
import { RevokeOperatorAccessCommand } from '../../../domain/models/cqrs/commands/revoke-operator-access.command';
import { CountRegisteredClientsQuery } from '../../../domain/models/cqrs/queries/count-registered-clients.query';
import { GetUserByEmailQuery } from '../../../domain/models/cqrs/queries/get-user-by-email.query';
import { GetUserByIdQuery } from '../../../domain/models/cqrs/queries/get-user-by-id.query';
import { ListRegisteredClientIdsQuery } from '../../../domain/models/cqrs/queries/list-registered-client-ids.query';
import { ListOperatorsQuery } from '../../../domain/models/cqrs/queries/list-operators.query';

@Controller()
@UsersProto.UsersServiceControllerMethods()
export class UsersGrpcController implements UsersProto.UsersServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  health(_request: UsersProto.HealthRequest): UsersProto.HealthResponse {
    return { status: 'ok' };
  }

  getUserByEmail(request: UsersProto.GetUserByEmailRequest) {
    return this.queryBus.execute(new GetUserByEmailQuery(request.email));
  }

  getUserById(request: UsersProto.GetUserByIdRequest) {
    return this.queryBus.execute(new GetUserByIdQuery(request.id));
  }

  createClientUser(request: UsersProto.CreateClientUserRequest) {
    return this.commandBus.execute(new CreateClientUserCommand(request));
  }

  listRegisteredClientIds(request: UsersProto.ListRegisteredClientIdsRequest) {
    return this.queryBus.execute(
      new ListRegisteredClientIdsQuery(request.clientIds),
    );
  }

  countRegisteredClients(_request: UsersProto.CountRegisteredClientsRequest) {
    return this.queryBus.execute(new CountRegisteredClientsQuery());
  }

  listOperators(request: UsersProto.ListOperatorsRequest) {
    return this.queryBus.execute(
      new ListOperatorsQuery(request.page, request.limit),
    );
  }

  createOperator(request: UsersProto.CreateOperatorRequest) {
    return this.commandBus.execute(new CreateOperatorCommand(request));
  }

  revokeOperatorAccess(request: UsersProto.RevokeOperatorAccessRequest) {
    return this.commandBus.execute(new RevokeOperatorAccessCommand(request.id));
  }
}

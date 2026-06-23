import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';
import { CreateClientUserCommand } from '../../../domain/models/cqrs/commands/create-client-user.command';
import { GetUserByEmailQuery } from '../../../domain/models/cqrs/queries/get-user-by-email.query';
import { GetUserByIdQuery } from '../../../domain/models/cqrs/queries/get-user-by-id.query';

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
}

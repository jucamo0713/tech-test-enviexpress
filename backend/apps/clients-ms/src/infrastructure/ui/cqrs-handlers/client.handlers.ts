import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CreateClientCommand } from '../../../domain/models/cqrs/commands/create-client.command';
import { DeleteClientCommand } from '../../../domain/models/cqrs/commands/delete-client.command';
import { UpdateClientCommand } from '../../../domain/models/cqrs/commands/update-client.command';
import { GetClientQuery } from '../../../domain/models/cqrs/queries/get-client.query';
import { ListClientsQuery } from '../../../domain/models/cqrs/queries/list-clients.query';
import { CreateClientUseCase } from '../../../domain/use-cases/create-client.use-case';
import { DeleteClientUseCase } from '../../../domain/use-cases/delete-client.use-case';
import { GetClientUseCase } from '../../../domain/use-cases/get-client.use-case';
import { ListClientsUseCase } from '../../../domain/use-cases/list-clients.use-case';
import { UpdateClientUseCase } from '../../../domain/use-cases/update-client.use-case';

@CommandHandler(CreateClientCommand)
export class CreateClientCommandHandler implements ICommandHandler<CreateClientCommand> {
  constructor(private readonly useCase: CreateClientUseCase) {}
  execute(command: CreateClientCommand) { return this.useCase.execute(command.payload); }
}

@CommandHandler(UpdateClientCommand)
export class UpdateClientCommandHandler implements ICommandHandler<UpdateClientCommand> {
  constructor(private readonly useCase: UpdateClientUseCase) {}
  execute(command: UpdateClientCommand) { return this.useCase.execute(command.id, command.payload); }
}

@CommandHandler(DeleteClientCommand)
export class DeleteClientCommandHandler implements ICommandHandler<DeleteClientCommand> {
  constructor(private readonly useCase: DeleteClientUseCase) {}
  execute(command: DeleteClientCommand) { return this.useCase.execute(command.id); }
}

@QueryHandler(ListClientsQuery)
export class ListClientsQueryHandler implements IQueryHandler<ListClientsQuery> {
  constructor(private readonly useCase: ListClientsUseCase) {}
  execute() { return this.useCase.execute(); }
}

@QueryHandler(GetClientQuery)
export class GetClientQueryHandler implements IQueryHandler<GetClientQuery> {
  constructor(private readonly useCase: GetClientUseCase) {}
  execute(query: GetClientQuery) { return this.useCase.execute(query.id); }
}

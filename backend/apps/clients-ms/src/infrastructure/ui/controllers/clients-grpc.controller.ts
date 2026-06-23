import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientsProto } from 'app/shared';
import { CreateClientCommand } from '../../../domain/models/cqrs/commands/create-client.command';
import { DeleteClientCommand } from '../../../domain/models/cqrs/commands/delete-client.command';
import { UpdateClientCommand } from '../../../domain/models/cqrs/commands/update-client.command';
import { GetClientQuery } from '../../../domain/models/cqrs/queries/get-client.query';
import { ListClientsQuery } from '../../../domain/models/cqrs/queries/list-clients.query';

@Controller()
@ClientsProto.ClientsServiceControllerMethods()
export class ClientsGrpcController implements ClientsProto.ClientsServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  health(_request: ClientsProto.HealthRequest): ClientsProto.HealthResponse {
    return { status: 'ok' };
  }

  async listClients(_request: ClientsProto.ListClientsRequest) {
    return { clients: await this.queryBus.execute(new ListClientsQuery()) };
  }

  getClient(request: ClientsProto.GetClientRequest) {
    return this.queryBus.execute(new GetClientQuery(request.id));
  }

  createClient(request: ClientsProto.CreateClientRequest) {
    return this.commandBus.execute(new CreateClientCommand(request));
  }

  updateClient(request: ClientsProto.UpdateClientRequest) {
    const { id, ...input } = request;
    return this.commandBus.execute(new UpdateClientCommand(id, input));
  }

  deleteClient(request: ClientsProto.DeleteClientRequest) {
    return this.commandBus.execute(new DeleteClientCommand(request.id));
  }
}

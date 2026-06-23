import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientsProto } from 'app/shared';
import { CreateClientCommand } from '../../../domain/models/cqrs/commands/create-client.command';
import { DeleteClientCommand } from '../../../domain/models/cqrs/commands/delete-client.command';
import { UpdateClientCommand } from '../../../domain/models/cqrs/commands/update-client.command';
import { GetClientQuery } from '../../../domain/models/cqrs/queries/get-client.query';
import { GetClientByEmailQuery } from '../../../domain/models/cqrs/queries/get-client-by-email.query';
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

  async listClients(
    request: ClientsProto.ListClientsRequest,
  ): Promise<ClientsProto.ListClientsResponse> {
    return this.queryBus.execute(
      new ListClientsQuery(
        this.normalizePage(request.page),
        this.normalizeLimit(request.limit),
      ),
    ) as Promise<ClientsProto.ListClientsResponse>;
  }

  getClient(request: ClientsProto.GetClientRequest) {
    return this.queryBus.execute(new GetClientQuery(request.id));
  }

  getClientByEmail(request: ClientsProto.GetClientByEmailRequest) {
    return this.queryBus.execute(new GetClientByEmailQuery(request.email));
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

  private normalizePage(page?: number): number {
    return Math.max(Number(page || 1), 1);
  }

  private normalizeLimit(limit?: number): number {
    return Math.min(Math.max(Number(limit || 10), 1), 100);
  }
}

import { firstValueFrom } from 'rxjs';
import { AuditProto, ClientsProto } from 'app/shared';
import { CreateClientRequest, UpdateClientRequest } from '../../infrastructure/dtos/clients/client.request';

export class ClientsOrchestratorUseCase {
  constructor(
    private readonly clientsService: ClientsProto.ClientsServiceClient,
    private readonly auditService: AuditProto.AuditServiceClient,
  ) {}

  async list() {
    const response = await firstValueFrom(this.clientsService.listClients({}));
    return response.clients;
  }

  get(id: string) {
    return firstValueFrom(this.clientsService.getClient({ id }));
  }

  async create(request: CreateClientRequest, userId?: string) {
    const client = (await firstValueFrom(
      this.clientsService.createClient(request),
    )) as ClientsProto.ClientResponse;
    await this.audit(client.id, 'created', userId ?? 'system', request);
    return client;
  }

  async update(id: string, request: UpdateClientRequest, userId?: string) {
    const client = await firstValueFrom(
      this.clientsService.updateClient({ id, ...request }),
    );
    await this.audit(id, 'updated', userId ?? 'system', request);
    return client;
  }

  async delete(id: string, userId?: string) {
    await firstValueFrom(this.clientsService.deleteClient({ id }));
    await this.audit(id, 'deleted', userId ?? 'system', {});
  }

  private async audit(
    entityId: string,
    action: string,
    actorId: string,
    metadata: unknown,
  ): Promise<void> {
    await firstValueFrom(
      this.auditService.createAuditRecord({
        entityType: 'client',
        entityId,
        action,
        actorId,
        metadata: JSON.stringify(metadata ?? {}),
      }),
    ).catch(() => undefined);
  }
}

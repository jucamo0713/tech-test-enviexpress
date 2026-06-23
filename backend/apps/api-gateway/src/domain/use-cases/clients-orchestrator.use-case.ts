import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'node:crypto';
import {
  AUDIT_EVENTS_CHANNEL,
  ClientsProto,
  RedisPubSubClient,
  UsersProto,
} from 'app/shared';
import { CreateClientRequest, UpdateClientRequest } from '../../infrastructure/dtos/clients/client.request';

export class ClientsOrchestratorUseCase {
  constructor(
    private readonly clientsService: ClientsProto.ClientsServiceClient,
    private readonly usersService: UsersProto.UsersServiceClient,
    private readonly redisPubSub: RedisPubSubClient,
  ) {}

  async list(page: number, limit: number, includeRegistrationStats = false) {
    const response = await firstValueFrom(
      this.clientsService.listClients({ page, limit }),
    );
    const clientIds = response.clients.map((client) => client.id);
    const [registeredClientIds, registrationStats] = includeRegistrationStats
      ? await Promise.all([
        this.getRegisteredClientIds(clientIds),
        this.getRegistrationStats(response.total),
      ])
      : [new Set<string>(), undefined];

    return {
      items: response.clients.map((client) => ({
        ...client,
        isRegistered: includeRegistrationStats
          ? registeredClientIds.has(client.id)
          : undefined,
      })),
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
      registrationStats,
    };
  }

  async getRegistrationStats(totalClients: number) {
    const response = await firstValueFrom(
      this.usersService.countRegisteredClients({}),
    );
    const registered = Math.min(response.total, totalClients);
    const unregistered = Math.max(totalClients - registered, 0);

    return {
      registered,
      unregistered,
      registeredPercentage: this.toPercentage(registered, totalClients),
      unregisteredPercentage: this.toPercentage(unregistered, totalClients),
    };
  }

  async getGlobalRegistrationStats() {
    const response = await firstValueFrom(
      this.clientsService.listClients({ page: 1, limit: 1 }),
    );
    return this.getRegistrationStats(response.total);
  }

  get(id: string) {
    return firstValueFrom(this.clientsService.getClient({ id }));
  }

  getByEmail(email: string) {
    return firstValueFrom(this.clientsService.getClientByEmail({ email }));
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
    await this.redisPubSub
      .publish(AUDIT_EVENTS_CHANNEL, {
        id: randomUUID(),
        name: `client.${action}`,
        aggregateType: 'client',
        aggregateId: entityId,
        occurredAt: new Date().toISOString(),
        requestId: '',
        payload: {
          eventType: action,
          actorId,
          metadata: metadata ?? {},
        },
      })
      .catch(() => undefined);
  }

  private async getRegisteredClientIds(clientIds: string[]): Promise<Set<string>> {
    const response = await firstValueFrom(
      this.usersService.listRegisteredClientIds({ clientIds }),
    );
    return new Set(response.clientIds);
  }

  private toPercentage(count: number, total: number): number {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }
}

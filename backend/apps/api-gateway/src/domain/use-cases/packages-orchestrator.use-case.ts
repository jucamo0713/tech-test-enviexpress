import { ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { firstValueFrom, from, mergeMap } from 'rxjs';
import {
  AUDIT_EVENTS_CHANNEL,
  ClientsProto,
  PackagesProto,
  PackageStatusProto,
  RedisPubSubClient,
  UsersProto,
} from 'app/shared';
import {
  CreatePackageRequest,
  UpdatePackageRequest,
} from '../../infrastructure/dtos/packages/package.request';

export type PackageStatus =
  | 'created'
  | 'received'
  | 'in_transit'
  | 'failed_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export class PackagesOrchestratorUseCase {
  constructor(
    private readonly packagesService: PackagesProto.PackagesServiceClient,
    private readonly clientsService: ClientsProto.ClientsServiceClient,
    private readonly packageStatusService: PackageStatusProto.PackageStatusServiceClient,
    private readonly usersService: UsersProto.UsersServiceClient,
    private readonly redisPubSub: RedisPubSubClient,
  ) {}

  async list(
    page: number,
    limit: number,
    clientId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const response = clientId
      ? await firstValueFrom(this.packagesService.listPackagesByClient({
        clientId,
        page,
        limit,
        status,
        startDate,
        endDate,
      }))
      : await firstValueFrom(this.packagesService.listPackages({
        page,
        limit,
        status,
        startDate,
        endDate,
      }));
    return this.toPaginatedResponse(response);
  }

  async listByClient(
    clientId: string,
    page: number,
    limit: number,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const response = await firstValueFrom(
      this.packagesService.listPackagesByClient({
        clientId,
        page,
        limit,
        status,
        startDate,
        endDate,
      }),
    );
    return this.toPaginatedResponse(response);
  }

  async get(id: string, clientId?: string) {
    const packageRecord = await firstValueFrom(this.packagesService.getPackage({ id }));
    this.assertClientOwnsPackage(packageRecord.clientId, clientId);
    return packageRecord;
  }

  async create(request: CreatePackageRequest, userId: string) {
    const client = await this.resolvePackageClient(request, userId);
    const packageRecord = await firstValueFrom(
      this.packagesService.createPackage({
        clientId: client.id,
        description: request.description,
        destinationAddress: request.destinationAddress,
        changedBy: userId,
      }),
    );
    await this.audit('package', packageRecord.id, 'created', userId, request);
    return packageRecord;
  }

  async update(id: string, request: UpdatePackageRequest, userId?: string) {
    const packageRecord = await firstValueFrom(
      this.packagesService.updatePackage({ id, ...request }),
    );
    await this.audit('package', id, 'updated', userId ?? 'system', request);
    return packageRecord;
  }

  async updateStatus(
    id: string,
    status: PackageStatus,
    userId: string,
    comment?: string,
  ) {
    const packageRecord = await firstValueFrom(
      this.packagesService.updatePackageStatus({
        id,
        status,
        changedBy: userId,
        comment,
      }),
    );
    return packageRecord;
  }

  getStatus(id: string) {
    return firstValueFrom(this.packageStatusService.getPackageStatus({ id }));
  }

  async getPublicStatus(trackingCode: string, email: string) {
    const packageRecord = await firstValueFrom(
      this.packagesService.getPackageByTrackingCode({
        trackingCode: trackingCode.toUpperCase(),
      }),
    );
    const client = await firstValueFrom(
      this.clientsService.getClient({ id: packageRecord.clientId }),
    );

    if (client.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Package does not belong to this email');
    }

    return firstValueFrom(
      this.packageStatusService.getPackageStatus({ id: packageRecord.id }),
    );
  }

  async trackStatus(trackingCode: string, email: string) {
    const packageRecord = await firstValueFrom(
      this.packagesService.getPackageByTrackingCode({
        trackingCode: trackingCode.toUpperCase(),
      }),
    );
    const client = await firstValueFrom(
      this.clientsService.getClient({ id: packageRecord.clientId }),
    );

    if (client.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Package does not belong to this email');
    }

    return this.packageStatusService.trackPackageStatus({
      trackingCode: packageRecord.trackingCode,
      email: client.email,
    });
  }

  async trackStatusById(id: string, clientId?: string) {
    const packageRecord = await firstValueFrom(this.packagesService.getPackage({ id }));
    this.assertClientOwnsPackage(packageRecord.clientId, clientId);
    const client = await firstValueFrom(
      this.clientsService.getClient({ id: packageRecord.clientId }),
    );

    return this.packageStatusService.trackPackageStatus({
      trackingCode: packageRecord.trackingCode,
      email: client.email,
    }).pipe(
      mergeMap((status) => from(this.enrichPackageActors(status))),
    );
  }

  async delete(id: string, userId?: string) {
    await firstValueFrom(this.packagesService.deletePackage({ id }));
    await this.audit('package', id, 'deleted', userId ?? 'system', {});
  }

  private async audit(
    entityType: string,
    entityId: string,
    action: string,
    actorId: string,
    metadata: unknown,
  ): Promise<void> {
    await this.redisPubSub
      .publish(AUDIT_EVENTS_CHANNEL, {
        id: randomUUID(),
        name: `${entityType}.${action}`,
        aggregateType: entityType,
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

  private assertClientOwnsPackage(packageClientId: string, requesterClientId?: string) {
    if (requesterClientId && packageClientId !== requesterClientId) {
      throw new ForbiddenException('Package does not belong to authenticated client');
    }
  }

  private async resolvePackageClient(
    request: CreatePackageRequest,
    userId: string,
  ): Promise<ClientsProto.ClientResponse> {
    if (request.clientId) {
      return firstValueFrom(this.clientsService.getClient({ id: request.clientId }));
    }

    const existingClient = await firstValueFrom(
      this.clientsService.getClientByEmail({ email: request.clientEmail }),
    ).catch(() => null);

    if (existingClient) return existingClient;

    const createdClient = await firstValueFrom(
      this.clientsService.createClient({
        name: request.clientName ?? request.clientEmail,
        email: request.clientEmail,
        phone: request.clientPhone ?? '',
        address: request.clientAddress ?? request.destinationAddress,
      }),
    );
    await this.audit('client', createdClient.id, 'created', userId, {
      source: 'package.create',
      email: request.clientEmail,
    });
    return createdClient;
  }

  private toPaginatedResponse(response: PackagesProto.ListPackagesResponse) {
    return {
      items: response.packages,
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    };
  }

  private async enrichPackageActors(
    packageRecord: PackageStatusProto.PackageStatusResponse,
  ): Promise<PackageStatusProto.PackageStatusResponse> {
    const nameByUserId = new Map<string, string>();

    await Promise.all(
      packageRecord.history.map(async (history) => {
        if (!history.changedBy || nameByUserId.has(history.changedBy)) return;

        const user = await firstValueFrom(
          this.usersService.getUserById({ id: history.changedBy }),
        ).catch(() => null);

        nameByUserId.set(history.changedBy, user?.name ?? history.changedBy);
      }),
    );

    return {
      ...packageRecord,
      history: packageRecord.history.map((history) => ({
        ...history,
        changedBy: nameByUserId.get(history.changedBy) ?? history.changedBy,
      })),
    };
  }
}

import { ForbiddenException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  AuditProto,
  ClientsProto,
  PackagesProto,
  PackageStatusProto,
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
    private readonly auditService: AuditProto.AuditServiceClient,
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
    await firstValueFrom(this.clientsService.getClient({ id: request.clientId }));
    const packageRecord = await firstValueFrom(
      this.packagesService.createPackage({ ...request, changedBy: userId }),
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
    await this.audit('package', id, `status:${status}`, userId, { comment });
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
    });
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
    await firstValueFrom(
      this.auditService.createAuditRecord({
        entityType,
        entityId,
        action,
        actorId,
        metadata: JSON.stringify(metadata ?? {}),
      }),
    ).catch(() => undefined);
  }

  private assertClientOwnsPackage(packageClientId: string, requesterClientId?: string) {
    if (requesterClientId && packageClientId !== requesterClientId) {
      throw new ForbiddenException('Package does not belong to authenticated client');
    }
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
}

import { firstValueFrom } from 'rxjs';
import { ForbiddenException } from '@nestjs/common';
import { ClientsProto, PackagesProto, RedisPubSubClient } from 'app/shared';

export class GetPackageStatusUseCase {
  constructor(
    private readonly packagesService: PackagesProto.PackagesServiceClient,
    private readonly clientsService: ClientsProto.ClientsServiceClient,
    private readonly redisPubSub: RedisPubSubClient,
  ) {}

  async execute(id: string) {
    const packageRecord = await this.getPackageById(id);

    return {
      id: packageRecord.id,
      trackingCode: packageRecord.trackingCode,
      status: packageRecord.status,
      history: packageRecord.history,
      updatedAt: packageRecord.updatedAt,
      clientId: packageRecord.clientId,
    };
  }

  async executePublicTracking(trackingCode: string, email: string) {
    const packageRecord = await this.getPackageByTrackingCode(trackingCode);
    const client = await firstValueFrom(
      this.clientsService.getClient({ id: packageRecord.clientId }),
    );

    if (client.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Package does not belong to this email');
    }

    return {
      id: packageRecord.id,
      trackingCode: packageRecord.trackingCode,
      status: packageRecord.status,
      history: packageRecord.history,
      updatedAt: packageRecord.updatedAt,
      clientId: packageRecord.clientId,
    };
  }

  private async getPackageById(id: string) {
    const cacheKey = `package-status:id:${id}`;
    const cached = await this.redisPubSub.getJson<PackagesProto.PackageResponse>(cacheKey);
    if (cached) return cached;

    const packageRecord = await firstValueFrom(this.packagesService.getPackage({ id }));
    await this.cachePackage(packageRecord);
    return packageRecord;
  }

  private async getPackageByTrackingCode(trackingCode: string) {
    const normalizedTrackingCode = trackingCode.toUpperCase();
    const cacheKey = `package-status:tracking:${normalizedTrackingCode}`;
    const cached = await this.redisPubSub.getJson<PackagesProto.PackageResponse>(cacheKey);
    if (cached) return cached;

    const packageRecord = await firstValueFrom(
      this.packagesService.getPackageByTrackingCode({
        trackingCode: normalizedTrackingCode,
      }),
    );
    await this.cachePackage(packageRecord);
    return packageRecord;
  }

  private async cachePackage(packageRecord: PackagesProto.PackageResponse) {
    await Promise.all([
      this.redisPubSub.setJson(`package-status:id:${packageRecord.id}`, packageRecord, 300),
      this.redisPubSub.setJson(
        `package-status:tracking:${packageRecord.trackingCode}`,
        packageRecord,
        300,
      ),
    ]);
  }
}

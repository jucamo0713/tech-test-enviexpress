import { BadRequestException } from '@nestjs/common';
import { PackageRepository } from '../../infrastructure/driven-adapters/database/package.repository';
import { RedisPubSubClient } from 'app/shared';
import {
  packageStateTransitions,
  PackageStatus,
} from '../state-machine/package-state-machine';

export class ListPackagesUseCase {
  constructor(private readonly repository: PackageRepository) {}
  async execute(
    page: number,
    limit: number,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const result = await this.repository.listPaginated({
      page,
      limit,
      status,
      startDate,
      endDate,
    });
    return {
      packages: result.packages,
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}

export class GetPackageUseCase {
  constructor(private readonly repository: PackageRepository) {}
  execute(id: string) { return this.repository.get(id); }
}

export class GetPackageByTrackingCodeUseCase {
  constructor(private readonly repository: PackageRepository) {}
  execute(trackingCode: string) { return this.repository.getByTrackingCode(trackingCode); }
}

export class ListPackagesByClientUseCase {
  constructor(private readonly repository: PackageRepository) {}
  async execute(
    clientId: string,
    page: number,
    limit: number,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const result = await this.repository.listByClientIdPaginated({
      clientId,
      page,
      limit,
      status,
      startDate,
      endDate,
    });
    return {
      packages: result.packages,
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}

export class CreatePackageUseCase {
  constructor(private readonly repository: PackageRepository) {}
  execute(payload: {
    clientId: string;
    description: string;
    destinationAddress: string;
    changedBy: string;
  }) { return this.repository.create(payload); }
}

export class UpdatePackageUseCase {
  constructor(private readonly repository: PackageRepository) {}
  execute(id: string, payload: Partial<{ description: string; destinationAddress: string }>) {
    return this.repository.update(id, payload);
  }
}

export class UpdatePackageStatusUseCase {
  constructor(
    private readonly repository: PackageRepository,
    private readonly redisPubSub: RedisPubSubClient,
  ) {}
  async execute(payload: {
    id: string;
    status: PackageStatus;
    changedBy: string;
    comment?: string;
  }) {
    const packageRecord = await this.repository.get(payload.id);
    const allowedTransitions = packageStateTransitions[packageRecord.status];

    if (!allowedTransitions.includes(payload.status as never)) {
      throw new BadRequestException(
        `Invalid package status transition from ${packageRecord.status} to ${payload.status}`,
      );
    }

    const updated = await this.repository.updateStatus(payload);

    await Promise.all([
      this.redisPubSub.delete(`package-status:id:${updated.id}`),
      this.redisPubSub.delete(`package-status:tracking:${updated.trackingCode}`),
    ]);

    await this.redisPubSub.publish('package.status.changed', {
      id: updated.id,
      name: 'package.status.changed',
      aggregateId: updated.id,
      aggregateType: 'package',
      occurredAt: new Date().toISOString(),
      requestId: '',
      payload: {
        packageId: updated.id,
        trackingCode: updated.trackingCode,
        clientId: updated.clientId,
        changedBy: payload.changedBy,
        status: updated.status,
        history: updated.history,
        updatedAt: updated.updatedAt,
      },
    });
    return updated;
  }
}

export class DeletePackageUseCase {
  constructor(private readonly repository: PackageRepository) {}
  async execute(id: string) {
    await this.repository.delete(id);
    return { deleted: true };
  }
}

export class GetPackageStatusStatsUseCase {
  constructor(private readonly repository: PackageRepository) {}

  async execute(startDate: string, endDate: string) {
    const items = await this.repository.getStatusStats({ startDate, endDate });

    return {
      items,
      total: items.reduce((total, item) => total + item.total, 0),
      startDate,
      endDate,
    };
  }
}

export class ListOperatorHistoryUseCase {
  constructor(private readonly repository: PackageRepository) {}
  async execute(operatorId: string, page: number, limit: number) {
    const result = await this.repository.listOperatorHistoryPaginated({
      operatorId,
      page,
      limit,
    });
    return {
      items: result.items,
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}

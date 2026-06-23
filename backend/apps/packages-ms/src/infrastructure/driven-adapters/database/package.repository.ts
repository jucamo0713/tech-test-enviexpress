import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model, type QueryFilter } from 'mongoose';
import { randomUUID } from 'node:crypto';
import {
  LimitValueObject,
  MongoAggregationUtils,
  PageValueObject,
  type PaginatedAggregationResult,
} from 'app/shared';
import type {
  Package,
  PackageHistory,
} from '../../../domain/models/entities/package';
import type { PackageStatus } from '../../../domain/state-machine/package-state-machine';
import { PackageDocument } from './package.schema';
import { DatabasePackageConfigConstants } from './database-package-config.constants';

@Injectable()
export class PackageRepository {
  constructor(
    @Inject(DatabasePackageConfigConstants.PACKAGE_DOCUMENT)
    private readonly packageModel: Model<PackageDocument>,
  ) {}

  async list(): Promise<Package[]> {
    const packages = await this.packageModel.find().sort({ createdAt: -1 }).lean();
    return packages.map((packageRecord) => this.toDomain(packageRecord));
  }

  async listPaginated(input: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    packages: Package[];
    total: number;
  }> {
    const page = Math.max(input.page, 1);
    const limit = Math.max(input.limit, 1);
    const filter = this.buildListFilter(input);
    const result = await this.packageModel.aggregate<PaginatedAggregationResult<PackageDocument>[number]>(
      MongoAggregationUtils.buildPaginationPipeline<PackageDocument>(
        new PageValueObject(page),
        new LimitValueObject(limit),
        { filter, sort: { createdAt: -1 } },
      ),
    );
    const aggregation = result[0];

    return {
      packages: (aggregation?.data ?? []).map((packageRecord) =>
        this.toDomain(packageRecord),
      ),
      total: aggregation?.total?.total ?? 0,
    };
  }

  async get(id: string): Promise<Package> {
    const packageRecord = await this.packageModel.findOne({ id }).lean();
    if (!packageRecord) throw new NotFoundException('Package not found');
    return this.toDomain(packageRecord);
  }

  async getByTrackingCode(trackingCode: string): Promise<Package> {
    const packageRecord = await this.packageModel
      .findOne({ trackingCode: trackingCode.toUpperCase() })
      .lean();
    if (!packageRecord) throw new NotFoundException('Package not found');
    return this.toDomain(packageRecord);
  }

  async findByTrackingCode(trackingCode: string): Promise<Package | null> {
    const packageRecord = await this.packageModel
      .findOne({ trackingCode: trackingCode.toUpperCase() })
      .lean();
    return packageRecord ? this.toDomain(packageRecord) : null;
  }

  async listByClientId(clientId: string): Promise<Package[]> {
    const packages = await this.packageModel
      .find({ clientId })
      .sort({ createdAt: -1 })
      .lean();
    return packages.map((packageRecord) => this.toDomain(packageRecord));
  }

  async listByClientIdPaginated(input: {
    clientId: string;
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ packages: Package[]; total: number }> {
    const page = Math.max(input.page, 1);
    const limit = Math.max(input.limit, 1);
    const filter = this.buildListFilter(input);
    const result = await this.packageModel.aggregate<PaginatedAggregationResult<PackageDocument>[number]>(
      MongoAggregationUtils.buildPaginationPipeline<PackageDocument>(
        new PageValueObject(page),
        new LimitValueObject(limit),
        {
          filter: { ...filter, clientId: input.clientId },
          sort: { createdAt: -1 },
        },
      ),
    );
    const aggregation = result[0];

    return {
      packages: (aggregation?.data ?? []).map((packageRecord) =>
        this.toDomain(packageRecord),
      ),
      total: aggregation?.total?.total ?? 0,
    };
  }

  async create(input: {
    clientId: string;
    description: string;
    destinationAddress: string;
    changedBy: string;
  }): Promise<Package> {
    const now = new Date();
    const packageRecord = await this.packageModel.create({
      id: randomUUID(),
      trackingCode: `ENV-${Date.now().toString(36).toUpperCase()}`,
      clientId: input.clientId,
      description: input.description,
      destinationAddress: input.destinationAddress,
      status: 'created',
      history: [
        {
          id: randomUUID(),
          status: 'created',
          comment: 'Package created',
          changedAt: now,
          changedBy: input.changedBy,
        },
      ],
    });
    return this.toDomain(packageRecord);
  }

  async createSeed(input: {
    id: string;
    trackingCode: string;
    clientId: string;
    description: string;
    destinationAddress: string;
    status: PackageStatus;
    changedBy: string;
    comment: string;
  }): Promise<Package> {
    const now = new Date();
    const packageRecord = await this.packageModel.create({
      id: input.id,
      trackingCode: input.trackingCode.toUpperCase(),
      clientId: input.clientId,
      description: input.description,
      destinationAddress: input.destinationAddress,
      status: input.status,
      history: [
        {
          id: randomUUID(),
          status: input.status,
          comment: input.comment,
          changedAt: now,
          changedBy: input.changedBy,
        },
      ],
    });
    return this.toDomain(packageRecord);
  }

  async update(
    id: string,
    input: Partial<{
      description: string;
      destinationAddress: string;
    }>,
  ): Promise<Package> {
    const packageRecord = await this.packageModel
      .findOneAndUpdate({ id }, { $set: input }, { new: true })
      .lean();

    if (!packageRecord) throw new NotFoundException('Package not found');
    return this.toDomain(packageRecord);
  }

  async updateStatus(input: {
    id: string;
    status: PackageStatus;
    changedBy: string;
    comment?: string;
  }): Promise<Package> {
    const history: PackageHistory = {
      id: randomUUID(),
      status: input.status,
      comment: input.comment,
      changedAt: new Date().toISOString(),
      changedBy: input.changedBy,
    };

    const packageRecord = await this.packageModel
      .findOneAndUpdate(
        { id: input.id },
        {
          $set: { status: input.status },
          $push: { history },
        },
        { new: true },
      )
      .lean();

    if (!packageRecord) throw new NotFoundException('Package not found');
    return this.toDomain(packageRecord);
  }

  async delete(id: string): Promise<void> {
    const result = await this.packageModel.deleteOne({ id });
    if (!result.deletedCount) throw new NotFoundException('Package not found');
  }

  private buildListFilter(input: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): QueryFilter<PackageDocument> {
    return {
      ...(input.status ? { status: input.status } : {}),
      ...MongoAggregationUtils.buildDateRangeFilter<PackageDocument>({
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        startField: 'createdAt',
        endField: 'createdAt',
      }),
    };
  }

  private toDomain(packageRecord: PackageDocument): Package {
    return {
      id: packageRecord.id,
      trackingCode: packageRecord.trackingCode,
      clientId: packageRecord.clientId,
      description: packageRecord.description,
      destinationAddress: packageRecord.destinationAddress,
      status: packageRecord.status as PackageStatus,
      history: packageRecord.history.map((history) => ({
        id: history.id,
        status: history.status as PackageStatus,
        comment: history.comment,
        changedAt: new Date(history.changedAt).toISOString(),
        changedBy: history.changedBy,
      })),
      createdAt: packageRecord.createdAt.toISOString(),
      updatedAt: packageRecord.updatedAt.toISOString(),
    };
  }
}

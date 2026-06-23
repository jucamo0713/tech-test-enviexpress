import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import {
  LimitValueObject,
  MongoAggregationUtils,
  PageValueObject,
  type PaginatedAggregationResult,
} from 'app/shared';
import type { Client } from '../../../domain/models/entities/client';
import { ClientDocument } from './client.schema';
import { DatabaseClientConfigConstants } from './database-client-config.constants';

@Injectable()
export class ClientRepository {
  constructor(
    @Inject(DatabaseClientConfigConstants.CLIENT_DOCUMENT)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  async list(): Promise<Client[]> {
    const clients = await this.clientModel.find().sort({ createdAt: -1 }).lean();
    return clients.map((client) => this.toDomain(client));
  }

  async listPaginated(input: {
    page: number;
    limit: number;
  }): Promise<{ clients: Client[]; total: number }> {
    const page = Math.max(input.page, 1);
    const limit = Math.max(input.limit, 1);
    const result = await this.clientModel.aggregate<PaginatedAggregationResult<ClientDocument>[number]>(
      MongoAggregationUtils.buildPaginationPipeline<ClientDocument>(
        new PageValueObject(page),
        new LimitValueObject(limit),
        { sort: { createdAt: -1 } },
      ),
    );
    const aggregation = result[0];

    return {
      clients: (aggregation?.data ?? []).map((client) => this.toDomain(client)),
      total: aggregation?.total?.total ?? 0,
    };
  }

  async get(id: string): Promise<Client> {
    const client = await this.clientModel.findOne({ id }).lean();
    if (!client) throw new NotFoundException('Client not found');
    return this.toDomain(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    const client = await this.clientModel
      .findOne({ email: email.toLowerCase() })
      .lean();
    return client ? this.toDomain(client) : null;
  }

  async create(input: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  }): Promise<Client> {
    const client = await this.clientModel.create({
      id: input.id ?? randomUUID(),
      ...input,
      email: input.email.toLowerCase(),
      active: true,
    });
    return this.toDomain(client);
  }

  async update(
    id: string,
    input: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
      active: boolean;
    }>,
  ): Promise<Client> {
    const update = {
      ...input,
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
    };
    const client = await this.clientModel
      .findOneAndUpdate({ id }, { $set: update }, { new: true })
      .lean();

    if (!client) throw new NotFoundException('Client not found');
    return this.toDomain(client);
  }

  async delete(id: string): Promise<void> {
    const result = await this.clientModel.deleteOne({ id });
    if (!result.deletedCount) throw new NotFoundException('Client not found');
  }

  private toDomain(client: ClientDocument): Client {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      active: client.active,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  }
}

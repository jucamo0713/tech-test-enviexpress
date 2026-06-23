import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import type { AuditRecord } from '../../../domain/models/entities/audit-record';
import {
  AuditRecordDocument,
} from './audit-record.schema';
import { DatabaseAuditConfigConstants } from './database-audit-config.constants';

@Injectable()
export class AuditRecordRepository {
  constructor(
    @Inject(DatabaseAuditConfigConstants.AUDIT_RECORD_DOCUMENT)
    private readonly auditRecordModel: Model<AuditRecordDocument>,
  ) {}

  async create(input: {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    metadata?: string;
  }): Promise<AuditRecord> {
    const record = await this.auditRecordModel.create({
      id: randomUUID(),
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorId: input.actorId,
      metadata: input.metadata || '{}',
    });

    return this.toDomain(record);
  }

  async list(filter: {
    entityType?: string;
    entityId?: string;
  }): Promise<AuditRecord[]> {
    const records = await this.auditRecordModel
      .find({
        ...(filter.entityType ? { entityType: filter.entityType } : {}),
        ...(filter.entityId ? { entityId: filter.entityId } : {}),
      })
      .sort({ createdAt: -1 })
      .lean();

    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: AuditRecordDocument): AuditRecord {
    return {
      id: record.id,
      entityType: record.entityType,
      entityId: record.entityId,
      action: record.action,
      actorId: record.actorId,
      metadata: record.metadata,
      createdAt: record.createdAt.toISOString(),
    };
  }
}

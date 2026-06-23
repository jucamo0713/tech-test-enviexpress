import { FactoryProvider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DatabaseConstants } from 'app/shared';
import {
  AuditRecordDocument,
  AuditRecordSchema,
} from './audit-record.schema';
import { DatabaseAuditConfigConstants } from './database-audit-config.constants';

export const DatabaseAuditRecordModelProvider: FactoryProvider<
  Model<AuditRecordDocument>
> = {
  inject: [getConnectionToken(DatabaseConstants.DATABASE_CONNECTION_NAME)],
  provide: DatabaseAuditConfigConstants.AUDIT_RECORD_DOCUMENT,
  useFactory: (connection: Connection): Model<AuditRecordDocument> =>
    connection.model<AuditRecordDocument>(
      DatabaseAuditConfigConstants.AUDIT_RECORD_COLLECTION_NAME,
      AuditRecordSchema,
    ),
};

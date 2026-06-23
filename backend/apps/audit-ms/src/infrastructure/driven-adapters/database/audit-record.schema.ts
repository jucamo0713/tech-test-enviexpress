import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'audit_records',
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class AuditRecordDocument {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, index: true })
  entityType!: string;

  @Prop({ required: true, index: true })
  entityId!: string;

  @Prop({ required: true, index: true })
  action!: string;

  @Prop({ required: true, index: true })
  actorId!: string;

  @Prop({ required: true, default: '{}' })
  metadata!: string;

  createdAt!: Date;
}

export type AuditRecordMongoDocument = HydratedDocument<AuditRecordDocument>;
export const AuditRecordModelName = AuditRecordDocument.name;
export const AuditRecordSchema = SchemaFactory.createForClass(AuditRecordDocument);
AuditRecordSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

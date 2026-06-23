import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false, versionKey: false })
export class PackageHistoryDocument {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  status!: string;

  @Prop()
  comment?: string;

  @Prop({ required: true })
  changedAt!: Date;

  @Prop({ required: true })
  changedBy!: string;
}

const PackageHistorySchema = SchemaFactory.createForClass(PackageHistoryDocument);

@Schema({
  collection: 'packages',
  timestamps: true,
  versionKey: false,
})
export class PackageDocument {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, unique: true, index: true })
  trackingCode!: string;

  @Prop({ required: true, index: true })
  clientId!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, trim: true })
  destinationAddress!: string;

  @Prop({
    required: true,
    enum: [
      'created',
      'received',
      'in_transit',
      'failed_delivery',
      'delivered',
      'returned',
      'cancelled',
    ],
    index: true,
  })
  status!: string;

  @Prop({ type: [PackageHistorySchema], default: [] })
  history!: PackageHistoryDocument[];

  createdAt!: Date;
  updatedAt!: Date;
}

export type PackageMongoDocument = HydratedDocument<PackageDocument>;
export const PackageModelName = PackageDocument.name;
export const PackageSchema = SchemaFactory.createForClass(PackageDocument);

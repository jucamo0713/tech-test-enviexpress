import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'clients',
  timestamps: true,
  versionKey: false,
})
export class ClientDocument {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, trim: true, index: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true, default: true, index: true })
  active!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export type ClientMongoDocument = HydratedDocument<ClientDocument>;
export const ClientModelName = ClientDocument.name;
export const ClientSchema = SchemaFactory.createForClass(ClientDocument);

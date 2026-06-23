import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'auth_sessions',
  timestamps: true,
  versionKey: false,
})
export class AuthSessionDocument {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, unique: true, index: true })
  refreshToken!: string;

  @Prop({ required: false, index: true })
  revokedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export type AuthSessionMongoDocument = HydratedDocument<AuthSessionDocument>;
export const AuthSessionModelName = AuthSessionDocument.name;
export const AuthSessionSchema = SchemaFactory.createForClass(AuthSessionDocument);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: false,
})
export class UserDocument {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, enum: ['admin', 'operator', 'client'], index: true })
  role!: string;

  @Prop({ required: false, index: true })
  clientId?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type UserMongoDocument = HydratedDocument<UserDocument>;
export const UserModelName = UserDocument.name;
export const UserSchema = SchemaFactory.createForClass(UserDocument);

import { FactoryProvider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DatabaseConstants } from 'app/shared';
import { UserDocument, UserSchema } from './user.schema';
import { DatabaseUserConfigConstants } from './database-user-config.constants';

export const DatabaseUserModelProvider: FactoryProvider<Model<UserDocument>> = {
  inject: [getConnectionToken(DatabaseConstants.DATABASE_CONNECTION_NAME)],
  provide: DatabaseUserConfigConstants.USER_DOCUMENT,
  useFactory: (connection: Connection): Model<UserDocument> =>
    connection.model<UserDocument>(
      DatabaseUserConfigConstants.USER_COLLECTION_NAME,
      UserSchema,
    ),
};

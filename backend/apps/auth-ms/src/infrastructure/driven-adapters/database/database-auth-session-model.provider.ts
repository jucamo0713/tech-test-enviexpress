import { FactoryProvider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DatabaseConstants } from 'app/shared';
import {
  AuthSessionDocument,
  AuthSessionSchema,
} from './auth-session.schema';
import { DatabaseAuthConfigConstants } from './database-auth-config.constants';

export const DatabaseAuthSessionModelProvider: FactoryProvider<
  Model<AuthSessionDocument>
> = {
  inject: [getConnectionToken(DatabaseConstants.DATABASE_CONNECTION_NAME)],
  provide: DatabaseAuthConfigConstants.AUTH_SESSION_DOCUMENT,
  useFactory: (connection: Connection): Model<AuthSessionDocument> =>
    connection.model<AuthSessionDocument>(
      DatabaseAuthConfigConstants.AUTH_SESSION_COLLECTION_NAME,
      AuthSessionSchema,
    ),
};

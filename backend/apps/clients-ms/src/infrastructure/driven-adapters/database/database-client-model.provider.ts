import { FactoryProvider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DatabaseConstants } from 'app/shared';
import { ClientDocument, ClientSchema } from './client.schema';
import { DatabaseClientConfigConstants } from './database-client-config.constants';

export const DatabaseClientModelProvider: FactoryProvider<Model<ClientDocument>> =
  {
    inject: [getConnectionToken(DatabaseConstants.DATABASE_CONNECTION_NAME)],
    provide: DatabaseClientConfigConstants.CLIENT_DOCUMENT,
    useFactory: (connection: Connection): Model<ClientDocument> =>
      connection.model<ClientDocument>(
        DatabaseClientConfigConstants.CLIENT_COLLECTION_NAME,
        ClientSchema,
      ),
  };

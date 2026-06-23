import { FactoryProvider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DatabaseConstants } from 'app/shared';
import { PackageDocument, PackageSchema } from './package.schema';
import { DatabasePackageConfigConstants } from './database-package-config.constants';

export const DatabasePackageModelProvider: FactoryProvider<
  Model<PackageDocument>
> = {
  inject: [getConnectionToken(DatabaseConstants.DATABASE_CONNECTION_NAME)],
  provide: DatabasePackageConfigConstants.PACKAGE_DOCUMENT,
  useFactory: (connection: Connection): Model<PackageDocument> =>
    connection.model<PackageDocument>(
      DatabasePackageConfigConstants.PACKAGE_COLLECTION_NAME,
      PackageSchema,
    ),
};

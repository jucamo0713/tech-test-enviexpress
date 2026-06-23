import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '@shared/application/config';
import { DatabaseConstants } from './database.constants';

@Module({
  imports: [
    ConditionalModule.registerWhen(
      MongooseModule.forRootAsync({
        connectionName: DatabaseConstants.DATABASE_CONNECTION_NAME,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (
          configService: ConfigService<EnvironmentVariables, true>,
        ) => ({
          uri: configService.getOrThrow('MONGO_URI', { infer: true }),
          autoIndex: true,
        }),
      }),
      (env) => env['MONGO_ENABLED'] === 'true',
    ),
  ],
})
export class DatabaseModule {}

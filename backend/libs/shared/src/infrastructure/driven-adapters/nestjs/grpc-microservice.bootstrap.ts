import { Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import type { EnvironmentVariables } from '@shared/application/config';
import { AppLogger } from './logger/app.logger';
import { configureNestApplicationGlobals } from './nest-application-globals';

export interface GrpcMicroserviceConfig {
  appName: string;
  module: Type<unknown>;
  packageName: string;
  protoFile: string;
  urlEnv: keyof Pick<
    EnvironmentVariables,
    | 'GRPC_AUDIT_URL'
    | 'GRPC_AUTH_URL'
    | 'GRPC_CLIENTS_URL'
    | 'GRPC_PACKAGES_URL'
    | 'GRPC_PACKAGE_STATUS_URL'
    | 'GRPC_USERS_URL'
  >;
}

export async function bootstrapGrpcMicroservice({
  appName,
  module,
  packageName,
  protoFile,
  urlEnv,
}: GrpcMicroserviceConfig): Promise<void> {
  const configService = new ConfigService<EnvironmentVariables, true>();
  const url = configService.getOrThrow(urlEnv, { infer: true });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(module, {
    transport: Transport.GRPC,
    options: {
      package: packageName,
      protoPath: join(
        process.cwd(),
        'libs/shared/src/infrastructure/contracts/proto',
        protoFile,
      ),
      url,
    },
  });

  configureNestApplicationGlobals(app);

  await app.listen();
  app.get(AppLogger).log(`${appName} listening on ${url}`, appName);
}

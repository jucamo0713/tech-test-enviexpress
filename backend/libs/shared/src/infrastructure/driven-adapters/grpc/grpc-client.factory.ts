import { Injectable } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { ConfigService } from '@nestjs/config';
import {
  ClientGrpcProxy,
  ClientProxyFactory,
} from '@nestjs/microservices';
import type { EnvironmentVariables } from '@shared/application/config';
import { GrpcProtoFiles } from '@shared/infrastructure/contracts';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import {
  REQUEST_ID_HEADER,
  resolveRequestId,
} from '@shared/infrastructure/driven-adapters/nestjs/middlewares';
import { buildGrpcClientOptions } from './grpc-client.config';

export type GrpcClientName =
  | 'auth'
  | 'users'
  | 'clients'
  | 'packages'
  | 'packageStatus';

const GrpcClientSettings: Record<
  GrpcClientName,
  {
    packageName: string;
    protoFile: string;
    urlEnv: keyof EnvironmentVariables;
  }
> = {
  auth: {
    packageName: 'auth',
    protoFile: GrpcProtoFiles.auth,
    urlEnv: 'GRPC_AUTH_URL',
  },
  clients: {
    packageName: 'clients',
    protoFile: GrpcProtoFiles.clients,
    urlEnv: 'GRPC_CLIENTS_URL',
  },
  packages: {
    packageName: 'packages',
    protoFile: GrpcProtoFiles.packages,
    urlEnv: 'GRPC_PACKAGES_URL',
  },
  packageStatus: {
    packageName: 'package_status',
    protoFile: GrpcProtoFiles.packageStatus,
    urlEnv: 'GRPC_PACKAGE_STATUS_URL',
  },
  users: {
    packageName: 'users',
    protoFile: GrpcProtoFiles.users,
    urlEnv: 'GRPC_USERS_URL',
  },
};

@Injectable()
export class GrpcClientFactory {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  create(clientName: GrpcClientName): ClientGrpcProxy {
    const settings = GrpcClientSettings[clientName];

    return ClientProxyFactory.create(
      buildGrpcClientOptions({
        packageName: settings.packageName,
        protoFile: settings.protoFile,
        url: this.configService.getOrThrow(settings.urlEnv),
      }),
    ) as ClientGrpcProxy;
  }

  createMetadata(): Metadata {
    const metadata = new Metadata();
    metadata.set(
      REQUEST_ID_HEADER,
      resolveRequestId(AsyncRequestContext.get('requestId')),
    );

    return metadata;
  }
}

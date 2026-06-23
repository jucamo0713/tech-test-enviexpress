import { Module } from '@nestjs/common';
import {
  ClientsProto,
  GrpcClientFactory,
  PackagesProto,
  RedisPubSubClient,
  SharedModule,
} from 'app/shared';
import { PackageStatusGrpcController } from '../infrastructure/ui/controllers/package-status-grpc.controller';
import { GetPackageStatusUseCase } from '../domain/use-cases/get-package-status.use-case';
import {
  GetPackageStatusQueryHandler,
  TrackPackageStatusQueryHandler,
} from '../infrastructure/ui/cqrs-handlers/get-package-status.query-handler';

const PackageStatusGrpcClients = {
  PACKAGES: Symbol('PACKAGE_STATUS_PACKAGES_GRPC_CLIENT'),
  CLIENTS: Symbol('PACKAGE_STATUS_CLIENTS_GRPC_CLIENT'),
} as const;

@Module({
  imports: [SharedModule],
  controllers: [PackageStatusGrpcController],
  providers: [
    {
      provide: PackageStatusGrpcClients.PACKAGES,
      inject: [GrpcClientFactory],
      useFactory: (
        factory: GrpcClientFactory,
      ): PackagesProto.PackagesServiceClient =>
        factory
          .create('packages')
          .getService<PackagesProto.PackagesServiceClient>(
            PackagesProto.PACKAGES_SERVICE_NAME,
          ),
    },
    {
      provide: PackageStatusGrpcClients.CLIENTS,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): ClientsProto.ClientsServiceClient =>
        factory
          .create('clients')
          .getService<ClientsProto.ClientsServiceClient>(
            ClientsProto.CLIENTS_SERVICE_NAME,
          ),
    },
    {
      provide: GetPackageStatusUseCase,
      inject: [
        PackageStatusGrpcClients.PACKAGES,
        PackageStatusGrpcClients.CLIENTS,
        RedisPubSubClient,
      ],
      useFactory: (
        packagesClient: PackagesProto.PackagesServiceClient,
        clientsClient: ClientsProto.ClientsServiceClient,
        redisPubSub: RedisPubSubClient,
      ) => new GetPackageStatusUseCase(packagesClient, clientsClient, redisPubSub),
    },
    GetPackageStatusQueryHandler,
    TrackPackageStatusQueryHandler,
  ],
})
export class PackageStatusModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  AuditProto,
  AuthProto,
  ClientsProto,
  GrpcClientFactory,
  PackagesProto,
  PackageStatusProto,
  SharedModule,
} from 'app/shared';
import { AuthOrchestratorUseCase } from '../domain/use-cases/auth-orchestrator.use-case';
import { ClientsOrchestratorUseCase } from '../domain/use-cases/clients-orchestrator.use-case';
import { PackagesOrchestratorUseCase } from '../domain/use-cases/packages-orchestrator.use-case';
import { AuthController } from '../infrastructure/ui/controllers/auth.controller';
import { ClientsController } from '../infrastructure/ui/controllers/clients.controller';
import { PackagesController } from '../infrastructure/ui/controllers/packages.controller';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../infrastructure/guards/roles.guard';
import {
  GatewayAuthCommandHandler,
  GatewayClientCommandHandlers,
  GatewayClientQueryHandlers,
  GatewayPackageCommandHandlers,
  GatewayPackageQueryHandlers,
} from '../infrastructure/ui/cqrs-handlers/gateway.handlers';

const GatewayGrpcClients = {
  AUTH: Symbol('GATEWAY_AUTH_GRPC_CLIENT'),
  CLIENTS: Symbol('GATEWAY_CLIENTS_GRPC_CLIENT'),
  PACKAGES: Symbol('GATEWAY_PACKAGES_GRPC_CLIENT'),
  PACKAGE_STATUS: Symbol('GATEWAY_PACKAGE_STATUS_GRPC_CLIENT'),
  AUDIT: Symbol('GATEWAY_AUDIT_GRPC_CLIENT'),
} as const;

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [AuthController, ClientsController, PackagesController],
  providers: [
    {
      provide: GatewayGrpcClients.AUTH,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): AuthProto.AuthServiceClient =>
        factory
          .create('auth')
          .getService<AuthProto.AuthServiceClient>(AuthProto.AUTH_SERVICE_NAME),
    },
    {
      provide: GatewayGrpcClients.CLIENTS,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): ClientsProto.ClientsServiceClient =>
        factory
          .create('clients')
          .getService<ClientsProto.ClientsServiceClient>(
            ClientsProto.CLIENTS_SERVICE_NAME,
          ),
    },
    {
      provide: GatewayGrpcClients.PACKAGES,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): PackagesProto.PackagesServiceClient =>
        factory
          .create('packages')
          .getService<PackagesProto.PackagesServiceClient>(
            PackagesProto.PACKAGES_SERVICE_NAME,
          ),
    },
    {
      provide: GatewayGrpcClients.PACKAGE_STATUS,
      inject: [GrpcClientFactory],
      useFactory: (
        factory: GrpcClientFactory,
      ): PackageStatusProto.PackageStatusServiceClient =>
        factory
          .create('packageStatus')
          .getService<PackageStatusProto.PackageStatusServiceClient>(
            PackageStatusProto.PACKAGE_STATUS_SERVICE_NAME,
          ),
    },
    {
      provide: GatewayGrpcClients.AUDIT,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): AuditProto.AuditServiceClient =>
        factory
          .create('audit')
          .getService<AuditProto.AuditServiceClient>(
            AuditProto.AUDIT_SERVICE_NAME,
          ),
    },
    {
      provide: AuthOrchestratorUseCase,
      inject: [GatewayGrpcClients.AUTH],
      useFactory: (authClient: AuthProto.AuthServiceClient) =>
        new AuthOrchestratorUseCase(authClient),
    },
    {
      provide: ClientsOrchestratorUseCase,
      inject: [GatewayGrpcClients.CLIENTS, GatewayGrpcClients.AUDIT],
      useFactory: (
        clientsClient: ClientsProto.ClientsServiceClient,
        auditClient: AuditProto.AuditServiceClient,
      ) => new ClientsOrchestratorUseCase(clientsClient, auditClient),
    },
    JwtAuthGuard,
    {
      provide: PackagesOrchestratorUseCase,
      inject: [
        GatewayGrpcClients.PACKAGES,
        GatewayGrpcClients.CLIENTS,
        GatewayGrpcClients.PACKAGE_STATUS,
        GatewayGrpcClients.AUDIT,
      ],
      useFactory: (
        packagesClient: PackagesProto.PackagesServiceClient,
        clientsClient: ClientsProto.ClientsServiceClient,
        packageStatusClient: PackageStatusProto.PackageStatusServiceClient,
        auditClient: AuditProto.AuditServiceClient,
      ) =>
        new PackagesOrchestratorUseCase(
          packagesClient,
          clientsClient,
          packageStatusClient,
          auditClient,
        ),
    },
    RolesGuard,
    ...GatewayAuthCommandHandler,
    ...GatewayClientCommandHandlers,
    ...GatewayClientQueryHandlers,
    ...GatewayPackageCommandHandlers,
    ...GatewayPackageQueryHandlers,
  ],
})
export class GatewayModule {}

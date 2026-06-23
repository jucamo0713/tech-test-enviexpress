import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import {
  AuthProto,
  ClientsProto,
  EnvironmentVariables,
  GrpcClientFactory,
  PackagesProto,
  PackageStatusProto,
  RedisPubSubClient,
  SharedModule,
  UsersProto,
} from 'app/shared';
import { AuthOrchestratorUseCase } from '../domain/use-cases/auth-orchestrator.use-case';
import { ClientsOrchestratorUseCase } from '../domain/use-cases/clients-orchestrator.use-case';
import { PackagesOrchestratorUseCase } from '../domain/use-cases/packages-orchestrator.use-case';
import { UsersOrchestratorUseCase } from '../domain/use-cases/users-orchestrator.use-case';
import { AuthController } from '../infrastructure/ui/controllers/auth.controller';
import { ClientsController } from '../infrastructure/ui/controllers/clients.controller';
import { PackagesController } from '../infrastructure/ui/controllers/packages.controller';
import { UsersController } from '../infrastructure/ui/controllers/users.controller';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../infrastructure/guards/roles.guard';
import {
  GatewayAuthCommandHandler,
  GatewayClientCommandHandlers,
  GatewayClientQueryHandlers,
  GatewayPackageCommandHandlers,
  GatewayPackageQueryHandlers,
  GatewayUserCommandHandlers,
  GatewayUserQueryHandlers,
} from '../infrastructure/ui/cqrs-handlers/gateway.handlers';

const GatewayGrpcClients = {
  AUTH: Symbol('GATEWAY_AUTH_GRPC_CLIENT'),
  CLIENTS: Symbol('GATEWAY_CLIENTS_GRPC_CLIENT'),
  PACKAGES: Symbol('GATEWAY_PACKAGES_GRPC_CLIENT'),
  PACKAGE_STATUS: Symbol('GATEWAY_PACKAGE_STATUS_GRPC_CLIENT'),
  USERS: 'GATEWAY_USERS_GRPC_CLIENT',
} as const;

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [AuthController, ClientsController, PackagesController, UsersController],
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
      provide: GatewayGrpcClients.USERS,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): UsersProto.UsersServiceClient =>
        factory
          .create('users')
          .getService<UsersProto.UsersServiceClient>(
            UsersProto.USERS_SERVICE_NAME,
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
      inject: [GatewayGrpcClients.CLIENTS, GatewayGrpcClients.USERS, RedisPubSubClient],
      useFactory: (
        clientsClient: ClientsProto.ClientsServiceClient,
        usersClient: UsersProto.UsersServiceClient,
        redisPubSub: RedisPubSubClient,
      ) => new ClientsOrchestratorUseCase(clientsClient, usersClient, redisPubSub),
    },
    {
      provide: UsersOrchestratorUseCase,
      inject: [GatewayGrpcClients.USERS],
      useFactory: (usersClient: UsersProto.UsersServiceClient) =>
        new UsersOrchestratorUseCase(usersClient),
    },
    {
      provide: JwtAuthGuard,
      inject: [JwtService, ConfigService, GatewayGrpcClients.USERS],
      useFactory: (
        jwtService: JwtService,
        configService: ConfigService<EnvironmentVariables, true>,
        usersClient: UsersProto.UsersServiceClient,
      ) => new JwtAuthGuard(
        jwtService,
        configService,
        usersClient,
      ),
    },
    {
      provide: PackagesOrchestratorUseCase,
      inject: [
        GatewayGrpcClients.PACKAGES,
        GatewayGrpcClients.CLIENTS,
        GatewayGrpcClients.PACKAGE_STATUS,
        GatewayGrpcClients.USERS,
        RedisPubSubClient,
      ],
      useFactory: (
        packagesClient: PackagesProto.PackagesServiceClient,
        clientsClient: ClientsProto.ClientsServiceClient,
        packageStatusClient: PackageStatusProto.PackageStatusServiceClient,
        usersClient: UsersProto.UsersServiceClient,
        redisPubSub: RedisPubSubClient,
      ) =>
        new PackagesOrchestratorUseCase(
          packagesClient,
          clientsClient,
          packageStatusClient,
          usersClient,
          redisPubSub,
        ),
    },
    RolesGuard,
    ...GatewayAuthCommandHandler,
    ...GatewayClientCommandHandlers,
    ...GatewayClientQueryHandlers,
    ...GatewayPackageCommandHandlers,
    ...GatewayPackageQueryHandlers,
    ...GatewayUserCommandHandlers,
    ...GatewayUserQueryHandlers,
  ],
})
export class GatewayModule {}

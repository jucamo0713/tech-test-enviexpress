import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from 'app/shared';
import { AuthSessionRepository } from '../infrastructure/driven-adapters/database/auth-session.repository';
import { DatabaseAuthSessionModelProvider } from '../infrastructure/driven-adapters/database/database-auth-session-model.provider';
import { AuthGrpcController } from '../infrastructure/ui/controllers/auth-grpc.controller';
import { LoginUseCase } from '../domain/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../domain/use-cases/refresh-token.use-case';
import { RegisterClientUseCase } from '../domain/use-cases/register-client.use-case';
import { LoginCommandHandler } from '../infrastructure/ui/cqrs-handlers/login.command-handler';
import { RefreshTokenCommandHandler } from '../infrastructure/ui/cqrs-handlers/refresh-token.command-handler';
import { RegisterClientCommandHandler } from '../infrastructure/ui/cqrs-handlers/register-client.command-handler';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ClientsProto,
  GrpcClientFactory,
  PackagesProto,
  RedisPubSubClient,
  UsersProto,
} from 'app/shared';
import type { EnvironmentVariables } from 'app/shared';

const AuthGrpcClients = {
  USERS: Symbol('AUTH_USERS_GRPC_CLIENT'),
  CLIENTS: Symbol('AUTH_CLIENTS_GRPC_CLIENT'),
  PACKAGES: Symbol('AUTH_PACKAGES_GRPC_CLIENT'),
} as const;

@Module({
  imports: [
    SharedModule,
    JwtModule.register({}),
  ],
  controllers: [AuthGrpcController],
  providers: [
    DatabaseAuthSessionModelProvider,
    AuthSessionRepository,
    {
      provide: AuthGrpcClients.CLIENTS,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): ClientsProto.ClientsServiceClient =>
        factory
          .create('clients')
          .getService<ClientsProto.ClientsServiceClient>(
            ClientsProto.CLIENTS_SERVICE_NAME,
          ),
    },
    {
      provide: AuthGrpcClients.PACKAGES,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): PackagesProto.PackagesServiceClient =>
        factory
          .create('packages')
          .getService<PackagesProto.PackagesServiceClient>(
            PackagesProto.PACKAGES_SERVICE_NAME,
          ),
    },
    {
      provide: AuthGrpcClients.USERS,
      inject: [GrpcClientFactory],
      useFactory: (factory: GrpcClientFactory): UsersProto.UsersServiceClient =>
        factory
          .create('users')
          .getService<UsersProto.UsersServiceClient>(
            UsersProto.USERS_SERVICE_NAME,
          ),
    },
    {
      provide: LoginUseCase,
      inject: [
        AuthGrpcClients.USERS,
        AuthSessionRepository,
        JwtService,
        ConfigService,
      ],
      useFactory: (
        usersClient: UsersProto.UsersServiceClient,
        sessionRepository: AuthSessionRepository,
        jwtService: JwtService,
        configService: ConfigService<EnvironmentVariables, true>,
      ) =>
        new LoginUseCase(
          usersClient,
          sessionRepository,
          jwtService,
          configService,
        ),
    },
    {
      provide: RefreshTokenUseCase,
      inject: [
        AuthGrpcClients.USERS,
        AuthSessionRepository,
        JwtService,
        ConfigService,
      ],
      useFactory: (
        usersClient: UsersProto.UsersServiceClient,
        sessionRepository: AuthSessionRepository,
        jwtService: JwtService,
        configService: ConfigService<EnvironmentVariables, true>,
      ) =>
        new RefreshTokenUseCase(
          usersClient,
          sessionRepository,
          jwtService,
          configService,
        ),
    },
    {
      provide: RegisterClientUseCase,
      inject: [
        AuthGrpcClients.PACKAGES,
        AuthGrpcClients.CLIENTS,
        AuthGrpcClients.USERS,
        AuthSessionRepository,
        JwtService,
        ConfigService,
        RedisPubSubClient,
      ],
      useFactory: (
        packagesClient: PackagesProto.PackagesServiceClient,
        clientsClient: ClientsProto.ClientsServiceClient,
        usersClient: UsersProto.UsersServiceClient,
        sessionRepository: AuthSessionRepository,
        jwtService: JwtService,
        configService: ConfigService<EnvironmentVariables, true>,
        redisPubSub: RedisPubSubClient,
      ) =>
        new RegisterClientUseCase(
          packagesClient,
          clientsClient,
          usersClient,
          sessionRepository,
          jwtService,
          configService,
          redisPubSub,
        ),
    },
    LoginCommandHandler,
    RefreshTokenCommandHandler,
    RegisterClientCommandHandler,
  ],
})
export class AuthModule {}

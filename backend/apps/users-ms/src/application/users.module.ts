import { Module } from '@nestjs/common';
import { SharedModule } from 'app/shared';
import { UserRepository } from '../infrastructure/driven-adapters/database/user.repository';
import { UsersGrpcController } from '../infrastructure/ui/controllers/users-grpc.controller';
import { DatabaseUserModelProvider } from '../infrastructure/driven-adapters/database/database-user-model.provider';
import { GetUserByEmailUseCase } from '../domain/use-cases/get-user-by-email.use-case';
import { GetUserByIdUseCase } from '../domain/use-cases/get-user-by-id.use-case';
import { EnsureDefaultAdminUseCase } from '../domain/use-cases/ensure-default-admin.use-case';
import { GetUserByEmailQueryHandler } from '../infrastructure/ui/cqrs-handlers/get-user-by-email.query-handler';
import { GetUserByIdQueryHandler } from '../infrastructure/ui/cqrs-handlers/get-user-by-id.query-handler';
import { CreateClientUserUseCase } from '../domain/use-cases/create-client-user.use-case';
import { CreateClientUserCommandHandler } from '../infrastructure/ui/cqrs-handlers/create-client-user.command-handler';
import { ListRegisteredClientIdsUseCase } from '../domain/use-cases/list-registered-client-ids.use-case';
import { ListRegisteredClientIdsQueryHandler } from '../infrastructure/ui/cqrs-handlers/list-registered-client-ids.query-handler';
import { CountRegisteredClientsUseCase } from '../domain/use-cases/count-registered-clients.use-case';
import { CountRegisteredClientsQueryHandler } from '../infrastructure/ui/cqrs-handlers/count-registered-clients.query-handler';
import { ListOperatorsUseCase } from '../domain/use-cases/list-operators.use-case';
import { CreateOperatorUseCase } from '../domain/use-cases/create-operator.use-case';
import { RevokeOperatorAccessUseCase } from '../domain/use-cases/revoke-operator-access.use-case';
import { UpdateProfileUseCase } from '../domain/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../domain/use-cases/change-password.use-case';
import { ListOperatorsQueryHandler } from '../infrastructure/ui/cqrs-handlers/list-operators.query-handler';
import { CreateOperatorCommandHandler } from '../infrastructure/ui/cqrs-handlers/create-operator.command-handler';
import { RevokeOperatorAccessCommandHandler } from '../infrastructure/ui/cqrs-handlers/revoke-operator-access.command-handler';
import { UpdateProfileCommandHandler } from '../infrastructure/ui/cqrs-handlers/update-profile.command-handler';
import { ChangePasswordCommandHandler } from '../infrastructure/ui/cqrs-handlers/change-password.command-handler';

const EnsureDefaultAdminProvider = {
  provide: Symbol('ENSURE_DEFAULT_ADMIN_PROVIDER'),
  inject: [EnsureDefaultAdminUseCase],
  useFactory: async (useCase: EnsureDefaultAdminUseCase): Promise<boolean> => {
    await useCase.execute();
    return true;
  },
};

@Module({
  imports: [SharedModule],
  controllers: [UsersGrpcController],
  providers: [
    DatabaseUserModelProvider,
    UserRepository,
    {
      provide: GetUserByEmailUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new GetUserByEmailUseCase(repository),
    },
    {
      provide: GetUserByIdUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) => new GetUserByIdUseCase(repository),
    },
    {
      provide: EnsureDefaultAdminUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new EnsureDefaultAdminUseCase(repository),
    },
    {
      provide: CreateClientUserUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new CreateClientUserUseCase(repository),
    },
    {
      provide: ListRegisteredClientIdsUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new ListRegisteredClientIdsUseCase(repository),
    },
    {
      provide: CountRegisteredClientsUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new CountRegisteredClientsUseCase(repository),
    },
    {
      provide: ListOperatorsUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new ListOperatorsUseCase(repository),
    },
    {
      provide: CreateOperatorUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new CreateOperatorUseCase(repository),
    },
    {
      provide: RevokeOperatorAccessUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new RevokeOperatorAccessUseCase(repository),
    },
    {
      provide: UpdateProfileUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new UpdateProfileUseCase(repository),
    },
    {
      provide: ChangePasswordUseCase,
      inject: [UserRepository],
      useFactory: (repository: UserRepository) =>
        new ChangePasswordUseCase(repository),
    },
    EnsureDefaultAdminProvider,
    CreateClientUserCommandHandler,
    CreateOperatorCommandHandler,
    RevokeOperatorAccessCommandHandler,
    UpdateProfileCommandHandler,
    ChangePasswordCommandHandler,
    GetUserByEmailQueryHandler,
    GetUserByIdQueryHandler,
    ListRegisteredClientIdsQueryHandler,
    CountRegisteredClientsQueryHandler,
    ListOperatorsQueryHandler,
  ],
})
export class UsersModule {}

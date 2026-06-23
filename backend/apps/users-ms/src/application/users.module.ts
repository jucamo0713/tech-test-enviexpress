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
    EnsureDefaultAdminProvider,
    CreateClientUserCommandHandler,
    GetUserByEmailQueryHandler,
    GetUserByIdQueryHandler,
  ],
})
export class UsersModule {}

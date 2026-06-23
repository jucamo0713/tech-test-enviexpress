import { Module } from '@nestjs/common';
import { SharedModule } from 'app/shared';
import { ClientRepository } from '../infrastructure/driven-adapters/database/client.repository';
import { ClientsGrpcController } from '../infrastructure/ui/controllers/clients-grpc.controller';
import { DatabaseClientModelProvider } from '../infrastructure/driven-adapters/database/database-client-model.provider';
import { CreateClientUseCase } from '../domain/use-cases/create-client.use-case';
import { DeleteClientUseCase } from '../domain/use-cases/delete-client.use-case';
import { GetClientUseCase } from '../domain/use-cases/get-client.use-case';
import { ListClientsUseCase } from '../domain/use-cases/list-clients.use-case';
import { UpdateClientUseCase } from '../domain/use-cases/update-client.use-case';
import { EnsureDefaultClientsUseCase } from '../domain/use-cases/ensure-default-clients.use-case';
import {
  CreateClientCommandHandler,
  DeleteClientCommandHandler,
  GetClientQueryHandler,
  ListClientsQueryHandler,
  UpdateClientCommandHandler,
} from '../infrastructure/ui/cqrs-handlers/client.handlers';

const EnsureDefaultClientsProvider = {
  provide: Symbol('ENSURE_DEFAULT_CLIENTS_PROVIDER'),
  inject: [EnsureDefaultClientsUseCase],
  useFactory: async (useCase: EnsureDefaultClientsUseCase): Promise<boolean> => {
    await useCase.execute();
    return true;
  },
};

@Module({
  imports: [SharedModule],
  controllers: [ClientsGrpcController],
  providers: [
    DatabaseClientModelProvider,
    ClientRepository,
    ...[
      CreateClientUseCase,
      UpdateClientUseCase,
      DeleteClientUseCase,
      ListClientsUseCase,
      GetClientUseCase,
      EnsureDefaultClientsUseCase,
    ].map((useCase) => ({
      provide: useCase,
      inject: [ClientRepository],
      useFactory: (repository: ClientRepository) => new useCase(repository),
    })),
    EnsureDefaultClientsProvider,
    CreateClientCommandHandler,
    UpdateClientCommandHandler,
    DeleteClientCommandHandler,
    ListClientsQueryHandler,
    GetClientQueryHandler,
  ],
})
export class ClientsModule {}

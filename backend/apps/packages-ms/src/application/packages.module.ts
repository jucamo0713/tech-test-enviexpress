import { Module } from '@nestjs/common';
import { RedisPubSubClient, SharedModule } from 'app/shared';
import { PackageRepository } from '../infrastructure/driven-adapters/database/package.repository';
import { PackagesGrpcController } from '../infrastructure/ui/controllers/packages-grpc.controller';
import { DatabasePackageModelProvider } from '../infrastructure/driven-adapters/database/database-package-model.provider';
import {
  CreatePackageUseCase,
  DeletePackageUseCase,
  GetPackageByTrackingCodeUseCase,
  GetPackageUseCase,
  ListPackagesByClientUseCase,
  ListPackagesUseCase,
  UpdatePackageStatusUseCase,
  UpdatePackageUseCase,
} from '../domain/use-cases/package.use-cases';
import { EnsureDefaultPackagesUseCase } from '../domain/use-cases/ensure-default-packages.use-case';
import {
  CreatePackageCommandHandler,
  DeletePackageCommandHandler,
  GetPackageByTrackingCodeQueryHandler,
  GetPackageQueryHandler,
  ListPackagesByClientQueryHandler,
  ListPackagesQueryHandler,
  UpdatePackageCommandHandler,
  UpdatePackageStatusCommandHandler,
} from '../infrastructure/ui/cqrs-handlers/package.handlers';

const EnsureDefaultPackagesProvider = {
  provide: Symbol('ENSURE_DEFAULT_PACKAGES_PROVIDER'),
  inject: [EnsureDefaultPackagesUseCase],
  useFactory: async (useCase: EnsureDefaultPackagesUseCase): Promise<boolean> => {
    await useCase.execute();
    return true;
  },
};

@Module({
  imports: [SharedModule],
  controllers: [PackagesGrpcController],
  providers: [
    DatabasePackageModelProvider,
    PackageRepository,
    ...[
      CreatePackageUseCase,
      UpdatePackageUseCase,
      DeletePackageUseCase,
      ListPackagesUseCase,
      ListPackagesByClientUseCase,
      GetPackageUseCase,
      GetPackageByTrackingCodeUseCase,
      EnsureDefaultPackagesUseCase,
    ].map((useCase) => ({
      provide: useCase,
      inject: [PackageRepository],
      useFactory: (repository: PackageRepository) => new useCase(repository),
    })),
    EnsureDefaultPackagesProvider,
    {
      provide: UpdatePackageStatusUseCase,
      inject: [PackageRepository, RedisPubSubClient],
      useFactory: (
        repository: PackageRepository,
        redisPubSub: RedisPubSubClient,
      ) => new UpdatePackageStatusUseCase(repository, redisPubSub),
    },
    CreatePackageCommandHandler,
    UpdatePackageCommandHandler,
    UpdatePackageStatusCommandHandler,
    DeletePackageCommandHandler,
    ListPackagesQueryHandler,
    ListPackagesByClientQueryHandler,
    GetPackageQueryHandler,
    GetPackageByTrackingCodeQueryHandler,
  ],
})
export class PackagesModule {}

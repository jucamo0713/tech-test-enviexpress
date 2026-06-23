import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CreatePackageCommand,
  DeletePackageCommand,
  UpdatePackageCommand,
  UpdatePackageStatusCommand,
} from '../../../domain/models/cqrs/commands/package.commands';
import {
  GetPackageByTrackingCodeQuery,
  GetPackageQuery,
  ListPackagesByClientQuery,
  ListPackagesQuery,
} from '../../../domain/models/cqrs/queries/package.queries';
import {
  CreatePackageUseCase,
  DeletePackageUseCase,
  GetPackageByTrackingCodeUseCase,
  GetPackageUseCase,
  ListPackagesByClientUseCase,
  ListPackagesUseCase,
  UpdatePackageStatusUseCase,
  UpdatePackageUseCase,
} from '../../../domain/use-cases/package.use-cases';

@CommandHandler(CreatePackageCommand)
export class CreatePackageCommandHandler implements ICommandHandler<CreatePackageCommand> {
  constructor(private readonly useCase: CreatePackageUseCase) {}
  execute(command: CreatePackageCommand) { return this.useCase.execute(command.payload); }
}

@CommandHandler(UpdatePackageCommand)
export class UpdatePackageCommandHandler implements ICommandHandler<UpdatePackageCommand> {
  constructor(private readonly useCase: UpdatePackageUseCase) {}
  execute(command: UpdatePackageCommand) { return this.useCase.execute(command.id, command.payload); }
}

@CommandHandler(UpdatePackageStatusCommand)
export class UpdatePackageStatusCommandHandler implements ICommandHandler<UpdatePackageStatusCommand> {
  constructor(private readonly useCase: UpdatePackageStatusUseCase) {}
  execute(command: UpdatePackageStatusCommand) { return this.useCase.execute(command.payload); }
}

@CommandHandler(DeletePackageCommand)
export class DeletePackageCommandHandler implements ICommandHandler<DeletePackageCommand> {
  constructor(private readonly useCase: DeletePackageUseCase) {}
  execute(command: DeletePackageCommand) { return this.useCase.execute(command.id); }
}

@QueryHandler(ListPackagesQuery)
export class ListPackagesQueryHandler implements IQueryHandler<ListPackagesQuery> {
  constructor(private readonly useCase: ListPackagesUseCase) {}
  execute(query: ListPackagesQuery) {
    return this.useCase.execute(
      query.page,
      query.limit,
      query.status,
      query.startDate,
      query.endDate,
    );
  }
}

@QueryHandler(ListPackagesByClientQuery)
export class ListPackagesByClientQueryHandler implements IQueryHandler<ListPackagesByClientQuery> {
  constructor(private readonly useCase: ListPackagesByClientUseCase) {}
  execute(query: ListPackagesByClientQuery) {
    return this.useCase.execute(
      query.clientId,
      query.page,
      query.limit,
      query.status,
      query.startDate,
      query.endDate,
    );
  }
}

@QueryHandler(GetPackageQuery)
export class GetPackageQueryHandler implements IQueryHandler<GetPackageQuery> {
  constructor(private readonly useCase: GetPackageUseCase) {}
  execute(query: GetPackageQuery) { return this.useCase.execute(query.id); }
}

@QueryHandler(GetPackageByTrackingCodeQuery)
export class GetPackageByTrackingCodeQueryHandler implements IQueryHandler<GetPackageByTrackingCodeQuery> {
  constructor(private readonly useCase: GetPackageByTrackingCodeUseCase) {}
  execute(query: GetPackageByTrackingCodeQuery) { return this.useCase.execute(query.trackingCode); }
}

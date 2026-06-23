import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GatewayCreateClientCommand,
  GatewayCreateOperatorCommand,
  GatewayCreatePackageCommand,
  GatewayChangePasswordCommand,
  GatewayDeleteClientCommand,
  GatewayGetClientRegistrationStatsQuery,
  GatewayDeletePackageCommand,
  GatewayGetClientQuery,
  GatewayGetClientByEmailQuery,
  GatewayGetPackageQuery,
  GatewayGetPackageStatusStatsQuery,
  GatewayGetPackageStatusQuery,
  GatewayGetProfileQuery,
  GatewayGetPublicPackageStatusQuery,
  GatewayListClientsQuery,
  GatewayListClientPackagesQuery,
  GatewayListPackagesQuery,
  GatewayListOperatorsQuery,
  GatewayListOperatorHistoryQuery,
  GatewayLoginCommand,
  GatewayRefreshTokenCommand,
  GatewayRegisterClientCommand,
  GatewayRevokeOperatorAccessCommand,
  GatewayTrackPackageStatusByIdQuery,
  GatewayTrackPackageStatusQuery,
  GatewayUpdateClientCommand,
  GatewayUpdatePackageCommand,
  GatewayUpdatePackageStatusCommand,
  GatewayUpdateProfileCommand,
} from '../../../domain/models/cqrs/gateway.messages';
import { AuthOrchestratorUseCase } from '../../../domain/use-cases/auth-orchestrator.use-case';
import { ClientsOrchestratorUseCase } from '../../../domain/use-cases/clients-orchestrator.use-case';
import { PackagesOrchestratorUseCase } from '../../../domain/use-cases/packages-orchestrator.use-case';
import { UsersOrchestratorUseCase } from '../../../domain/use-cases/users-orchestrator.use-case';

@CommandHandler(GatewayLoginCommand)
export class GatewayLoginCommandHandler implements ICommandHandler<GatewayLoginCommand> {
  constructor(private readonly useCase: AuthOrchestratorUseCase) {}
  execute(command: GatewayLoginCommand) { return this.useCase.login(command.email, command.password); }
}

@CommandHandler(GatewayRefreshTokenCommand)
export class GatewayRefreshTokenCommandHandler implements ICommandHandler<GatewayRefreshTokenCommand> {
  constructor(private readonly useCase: AuthOrchestratorUseCase) {}
  execute(command: GatewayRefreshTokenCommand) { return this.useCase.refresh(command.refreshToken); }
}

@CommandHandler(GatewayRegisterClientCommand)
export class GatewayRegisterClientCommandHandler implements ICommandHandler<GatewayRegisterClientCommand> {
  constructor(private readonly useCase: AuthOrchestratorUseCase) {}
  execute(command: GatewayRegisterClientCommand) {
    return this.useCase.registerClient(command.trackingCode, command.email, command.password);
  }
}

@QueryHandler(GatewayListClientsQuery)
export class GatewayListClientsQueryHandler implements IQueryHandler<GatewayListClientsQuery> {
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}
  execute(query: GatewayListClientsQuery) {
    return this.useCase.list(
      query.page,
      query.limit,
      query.includeRegistrationStats,
    );
  }
}

@QueryHandler(GatewayGetClientRegistrationStatsQuery)
export class GatewayGetClientRegistrationStatsQueryHandler
  implements IQueryHandler<GatewayGetClientRegistrationStatsQuery>
{
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}

  execute(_query: GatewayGetClientRegistrationStatsQuery) {
    return this.useCase.getGlobalRegistrationStats();
  }
}

@QueryHandler(GatewayGetClientQuery)
export class GatewayGetClientQueryHandler implements IQueryHandler<GatewayGetClientQuery> {
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}
  execute(query: GatewayGetClientQuery) { return this.useCase.get(query.id); }
}

@QueryHandler(GatewayGetClientByEmailQuery)
export class GatewayGetClientByEmailQueryHandler implements IQueryHandler<GatewayGetClientByEmailQuery> {
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}
  execute(query: GatewayGetClientByEmailQuery) { return this.useCase.getByEmail(query.email); }
}

@CommandHandler(GatewayCreateClientCommand)
export class GatewayCreateClientCommandHandler implements ICommandHandler<GatewayCreateClientCommand> {
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}
  execute(command: GatewayCreateClientCommand) { return this.useCase.create(command.payload as never, command.userId); }
}

@CommandHandler(GatewayUpdateClientCommand)
export class GatewayUpdateClientCommandHandler implements ICommandHandler<GatewayUpdateClientCommand> {
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}
  execute(command: GatewayUpdateClientCommand) { return this.useCase.update(command.id, command.payload as never, command.userId); }
}

@CommandHandler(GatewayDeleteClientCommand)
export class GatewayDeleteClientCommandHandler implements ICommandHandler<GatewayDeleteClientCommand> {
  constructor(private readonly useCase: ClientsOrchestratorUseCase) {}
  execute(command: GatewayDeleteClientCommand) { return this.useCase.delete(command.id, command.userId); }
}

@QueryHandler(GatewayListOperatorsQuery)
export class GatewayListOperatorsQueryHandler implements IQueryHandler<GatewayListOperatorsQuery> {
  constructor(private readonly useCase: UsersOrchestratorUseCase) {}
  execute(query: GatewayListOperatorsQuery) {
    return this.useCase.listOperators(query.page, query.limit);
  }
}

@CommandHandler(GatewayCreateOperatorCommand)
export class GatewayCreateOperatorCommandHandler
  implements ICommandHandler<GatewayCreateOperatorCommand>
{
  constructor(private readonly useCase: UsersOrchestratorUseCase) {}
  execute(command: GatewayCreateOperatorCommand) {
    return this.useCase.createOperator(command.payload as never);
  }
}

@CommandHandler(GatewayRevokeOperatorAccessCommand)
export class GatewayRevokeOperatorAccessCommandHandler
  implements ICommandHandler<GatewayRevokeOperatorAccessCommand>
{
  constructor(private readonly useCase: UsersOrchestratorUseCase) {}
  execute(command: GatewayRevokeOperatorAccessCommand) {
    return this.useCase.revokeOperatorAccess(command.id);
  }
}

@QueryHandler(GatewayGetProfileQuery)
export class GatewayGetProfileQueryHandler
  implements IQueryHandler<GatewayGetProfileQuery>
{
  constructor(private readonly useCase: UsersOrchestratorUseCase) {}
  execute(query: GatewayGetProfileQuery) {
    return this.useCase.getProfile(query.userId);
  }
}

@CommandHandler(GatewayUpdateProfileCommand)
export class GatewayUpdateProfileCommandHandler
  implements ICommandHandler<GatewayUpdateProfileCommand>
{
  constructor(private readonly useCase: UsersOrchestratorUseCase) {}
  execute(command: GatewayUpdateProfileCommand) {
    return this.useCase.updateProfile(command.userId, command.payload as never);
  }
}

@CommandHandler(GatewayChangePasswordCommand)
export class GatewayChangePasswordCommandHandler
  implements ICommandHandler<GatewayChangePasswordCommand>
{
  constructor(private readonly useCase: UsersOrchestratorUseCase) {}
  execute(command: GatewayChangePasswordCommand) {
    return this.useCase.changePassword(command.userId, command.payload as never);
  }
}

@QueryHandler(GatewayListPackagesQuery)
export class GatewayListPackagesQueryHandler implements IQueryHandler<GatewayListPackagesQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayListPackagesQuery) {
    return this.useCase.list(
      query.page,
      query.limit,
      undefined,
      query.status,
      query.startDate,
      query.endDate,
    );
  }
}

@QueryHandler(GatewayGetPackageStatusStatsQuery)
export class GatewayGetPackageStatusStatsQueryHandler
  implements IQueryHandler<GatewayGetPackageStatusStatsQuery>
{
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayGetPackageStatusStatsQuery) {
    return this.useCase.getStatusStats(query.period, query.referenceDate);
  }
}

@QueryHandler(GatewayListOperatorHistoryQuery)
export class GatewayListOperatorHistoryQueryHandler implements IQueryHandler<GatewayListOperatorHistoryQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayListOperatorHistoryQuery) {
    return this.useCase.listOperatorHistory(query.operatorId, query.page, query.limit);
  }
}

@QueryHandler(GatewayListClientPackagesQuery)
export class GatewayListClientPackagesQueryHandler implements IQueryHandler<GatewayListClientPackagesQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayListClientPackagesQuery) {
    return this.useCase.listByClient(
      query.clientId,
      query.page,
      query.limit,
      query.status,
      query.startDate,
      query.endDate,
    );
  }
}

@QueryHandler(GatewayGetPackageQuery)
export class GatewayGetPackageQueryHandler implements IQueryHandler<GatewayGetPackageQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayGetPackageQuery) { return this.useCase.get(query.id, query.clientId); }
}

@QueryHandler(GatewayGetPackageStatusQuery)
export class GatewayGetPackageStatusQueryHandler implements IQueryHandler<GatewayGetPackageStatusQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayGetPackageStatusQuery) { return this.useCase.getStatus(query.id); }
}

@QueryHandler(GatewayGetPublicPackageStatusQuery)
export class GatewayGetPublicPackageStatusQueryHandler implements IQueryHandler<GatewayGetPublicPackageStatusQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(query: GatewayGetPublicPackageStatusQuery) {
    return this.useCase.getPublicStatus(query.trackingCode, query.email);
  }
}

@QueryHandler(GatewayTrackPackageStatusQuery)
export class GatewayTrackPackageStatusQueryHandler implements IQueryHandler<GatewayTrackPackageStatusQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  async execute(query: GatewayTrackPackageStatusQuery) {
    return this.useCase.trackStatus(query.trackingCode, query.email);
  }
}

@QueryHandler(GatewayTrackPackageStatusByIdQuery)
export class GatewayTrackPackageStatusByIdQueryHandler implements IQueryHandler<GatewayTrackPackageStatusByIdQuery> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  async execute(query: GatewayTrackPackageStatusByIdQuery) {
    return this.useCase.trackStatusById(query.id, query.clientId);
  }
}

@CommandHandler(GatewayCreatePackageCommand)
export class GatewayCreatePackageCommandHandler implements ICommandHandler<GatewayCreatePackageCommand> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(command: GatewayCreatePackageCommand) { return this.useCase.create(command.payload as never, command.userId); }
}

@CommandHandler(GatewayUpdatePackageCommand)
export class GatewayUpdatePackageCommandHandler implements ICommandHandler<GatewayUpdatePackageCommand> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(command: GatewayUpdatePackageCommand) { return this.useCase.update(command.id, command.payload as never, command.userId); }
}

@CommandHandler(GatewayUpdatePackageStatusCommand)
export class GatewayUpdatePackageStatusCommandHandler implements ICommandHandler<GatewayUpdatePackageStatusCommand> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(command: GatewayUpdatePackageStatusCommand) {
    return this.useCase.updateStatus(command.id, command.status, command.userId, command.comment);
  }
}

@CommandHandler(GatewayDeletePackageCommand)
export class GatewayDeletePackageCommandHandler implements ICommandHandler<GatewayDeletePackageCommand> {
  constructor(private readonly useCase: PackagesOrchestratorUseCase) {}
  execute(command: GatewayDeletePackageCommand) { return this.useCase.delete(command.id, command.userId); }
}

export const GatewayAuthCommandHandler = [
  GatewayLoginCommandHandler,
  GatewayRefreshTokenCommandHandler,
  GatewayRegisterClientCommandHandler,
];
export const GatewayClientCommandHandlers = [
  GatewayCreateClientCommandHandler,
  GatewayUpdateClientCommandHandler,
  GatewayDeleteClientCommandHandler,
];
export const GatewayClientQueryHandlers = [
  GatewayListClientsQueryHandler,
  GatewayGetClientRegistrationStatsQueryHandler,
  GatewayGetClientQueryHandler,
  GatewayGetClientByEmailQueryHandler,
];
export const GatewayUserCommandHandlers = [
  GatewayCreateOperatorCommandHandler,
  GatewayRevokeOperatorAccessCommandHandler,
  GatewayUpdateProfileCommandHandler,
  GatewayChangePasswordCommandHandler,
];
export const GatewayUserQueryHandlers = [
  GatewayListOperatorsQueryHandler,
  GatewayGetProfileQueryHandler,
];
export const GatewayPackageCommandHandlers = [
  GatewayCreatePackageCommandHandler,
  GatewayUpdatePackageCommandHandler,
  GatewayUpdatePackageStatusCommandHandler,
  GatewayDeletePackageCommandHandler,
];
export const GatewayPackageQueryHandlers = [
  GatewayListPackagesQueryHandler,
  GatewayGetPackageStatusStatsQueryHandler,
  GatewayListClientPackagesQueryHandler,
  GatewayGetPackageQueryHandler,
  GatewayGetPackageStatusQueryHandler,
  GatewayGetPublicPackageStatusQueryHandler,
  GatewayTrackPackageStatusQueryHandler,
  GatewayTrackPackageStatusByIdQueryHandler,
];

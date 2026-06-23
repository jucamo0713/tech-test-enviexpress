import { Command, Query } from '@nestjs/cqrs';
import type { PackageStatus } from '../../use-cases/packages-orchestrator.use-case';

export class GatewayLoginCommand extends Command<unknown> {
  constructor(public readonly email: string, public readonly password: string) {
    super();
  }
}

export class GatewayRefreshTokenCommand extends Command<unknown> {
  constructor(public readonly refreshToken: string) { super(); }
}

export class GatewayRegisterClientCommand extends Command<unknown> {
  constructor(
    public readonly trackingCode: string,
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

export class GatewayListClientsQuery extends Query<unknown> {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly includeRegistrationStats = false,
  ) {
    super();
  }
}
export class GatewayGetClientRegistrationStatsQuery extends Query<unknown> {
  constructor() { super(); }
}
export class GatewayGetClientQuery extends Query<unknown> {
  constructor(public readonly id: string) { super(); }
}
export class GatewayGetClientByEmailQuery extends Query<unknown> {
  constructor(public readonly email: string) { super(); }
}
export class GatewayCreateClientCommand extends Command<unknown> {
  constructor(public readonly payload: unknown, public readonly userId: string) { super(); }
}
export class GatewayUpdateClientCommand extends Command<unknown> {
  constructor(public readonly id: string, public readonly payload: unknown, public readonly userId: string) { super(); }
}
export class GatewayDeleteClientCommand extends Command<void> {
  constructor(public readonly id: string, public readonly userId: string) { super(); }
}

export class GatewayListOperatorsQuery extends Query<unknown> {
  constructor(public readonly page: number, public readonly limit: number) {
    super();
  }
}
export class GatewayCreateOperatorCommand extends Command<unknown> {
  constructor(public readonly payload: unknown) { super(); }
}
export class GatewayRevokeOperatorAccessCommand extends Command<unknown> {
  constructor(public readonly id: string) { super(); }
}

export class GatewayListPackagesQuery extends Query<unknown> {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) { super(); }
}
export class GatewayListClientPackagesQuery extends Query<unknown> {
  constructor(
    public readonly clientId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) { super(); }
}
export class GatewayGetPackageQuery extends Query<unknown> {
  constructor(public readonly id: string, public readonly clientId?: string) { super(); }
}
export class GatewayGetPackageStatusQuery extends Query<unknown> {
  constructor(public readonly id: string) { super(); }
}
export class GatewayGetPublicPackageStatusQuery extends Query<unknown> {
  constructor(public readonly trackingCode: string, public readonly email: string) { super(); }
}
export class GatewayTrackPackageStatusQuery extends Query<unknown> {
  constructor(public readonly trackingCode: string, public readonly email: string) { super(); }
}
export class GatewayTrackPackageStatusByIdQuery extends Query<unknown> {
  constructor(public readonly id: string, public readonly clientId?: string) { super(); }
}
export class GatewayCreatePackageCommand extends Command<unknown> {
  constructor(public readonly payload: unknown, public readonly userId: string) { super(); }
}
export class GatewayUpdatePackageCommand extends Command<unknown> {
  constructor(public readonly id: string, public readonly payload: unknown, public readonly userId: string) { super(); }
}
export class GatewayUpdatePackageStatusCommand extends Command<unknown> {
  constructor(
    public readonly id: string,
    public readonly status: PackageStatus,
    public readonly userId: string,
    public readonly comment?: string,
  ) { super(); }
}
export class GatewayDeletePackageCommand extends Command<void> {
  constructor(public readonly id: string, public readonly userId: string) { super(); }
}

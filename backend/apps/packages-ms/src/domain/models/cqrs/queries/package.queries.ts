import { Query } from '@nestjs/cqrs';
import type { Package } from '../../entities/package';

export class ListPackagesQuery extends Query<unknown> {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {
    super();
  }
}

export class ListPackagesByClientQuery extends Query<unknown> {
  constructor(
    public readonly clientId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) { super(); }
}

export class GetPackageQuery extends Query<Package> {
  constructor(public readonly id: string) { super(); }
}

export class GetPackageByTrackingCodeQuery extends Query<Package> {
  constructor(public readonly trackingCode: string) { super(); }
}

export class GetPackageStatusStatsQuery extends Query<unknown> {
  constructor(public readonly startDate: string, public readonly endDate: string) {
    super();
  }
}

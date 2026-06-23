import { Query } from '@nestjs/cqrs';
import { PackageStatusProto } from 'app/shared';

export class GetPackageStatusQuery extends Query<PackageStatusProto.PackageStatusResponse> {
  constructor(public readonly id: string) {
    super();
  }
}

export class TrackPackageStatusQuery extends Query<PackageStatusProto.PackageStatusResponse> {
  constructor(
    public readonly trackingCode: string,
    public readonly email: string,
  ) {
    super();
  }
}

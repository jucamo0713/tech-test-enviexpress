import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetPackageStatusQuery,
  TrackPackageStatusQuery,
} from '../../../domain/models/cqrs/queries/get-package-status.query';
import { GetPackageStatusUseCase } from '../../../domain/use-cases/get-package-status.use-case';

@QueryHandler(GetPackageStatusQuery)
export class GetPackageStatusQueryHandler
  implements IQueryHandler<GetPackageStatusQuery>
{
  constructor(private readonly useCase: GetPackageStatusUseCase) {}

  execute(query: GetPackageStatusQuery) {
    return this.useCase.execute(query.id);
  }
}

@QueryHandler(TrackPackageStatusQuery)
export class TrackPackageStatusQueryHandler
  implements IQueryHandler<TrackPackageStatusQuery>
{
  constructor(private readonly useCase: GetPackageStatusUseCase) {}

  execute(query: TrackPackageStatusQuery) {
    return this.useCase.executePublicTracking(query.trackingCode, query.email);
  }
}

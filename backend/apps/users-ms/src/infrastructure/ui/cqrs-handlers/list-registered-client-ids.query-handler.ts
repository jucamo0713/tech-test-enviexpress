import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListRegisteredClientIdsQuery } from '../../../domain/models/cqrs/queries/list-registered-client-ids.query';
import { ListRegisteredClientIdsUseCase } from '../../../domain/use-cases/list-registered-client-ids.use-case';

@QueryHandler(ListRegisteredClientIdsQuery)
export class ListRegisteredClientIdsQueryHandler
  implements IQueryHandler<ListRegisteredClientIdsQuery>
{
  constructor(private readonly useCase: ListRegisteredClientIdsUseCase) {}

  async execute(query: ListRegisteredClientIdsQuery) {
    const clientIds = await this.useCase.execute(query.clientIds);
    return { clientIds };
  }
}

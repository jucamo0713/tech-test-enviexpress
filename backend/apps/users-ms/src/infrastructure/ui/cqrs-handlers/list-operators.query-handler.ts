import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOperatorsQuery } from '../../../domain/models/cqrs/queries/list-operators.query';
import { ListOperatorsUseCase } from '../../../domain/use-cases/list-operators.use-case';

@QueryHandler(ListOperatorsQuery)
export class ListOperatorsQueryHandler
  implements IQueryHandler<ListOperatorsQuery>
{
  constructor(private readonly useCase: ListOperatorsUseCase) {}

  execute(query: ListOperatorsQuery) {
    return this.useCase.execute(query.page, query.limit);
  }
}

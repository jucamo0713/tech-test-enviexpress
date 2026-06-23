import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../../../domain/models/cqrs/queries/get-user-by-id.query';
import { GetUserByIdUseCase } from '../../../domain/use-cases/get-user-by-id.use-case';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly useCase: GetUserByIdUseCase) {}

  execute(query: GetUserByIdQuery) {
    return this.useCase.execute(query.id);
  }
}

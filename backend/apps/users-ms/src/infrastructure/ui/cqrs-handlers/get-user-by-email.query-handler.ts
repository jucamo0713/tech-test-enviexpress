import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from '../../../domain/models/cqrs/queries/get-user-by-email.query';
import { GetUserByEmailUseCase } from '../../../domain/use-cases/get-user-by-email.use-case';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(private readonly useCase: GetUserByEmailUseCase) {}

  execute(query: GetUserByEmailQuery) {
    return this.useCase.execute(query.email);
  }
}

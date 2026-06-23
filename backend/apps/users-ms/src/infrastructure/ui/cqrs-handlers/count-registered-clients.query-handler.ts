import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CountRegisteredClientsQuery } from '../../../domain/models/cqrs/queries/count-registered-clients.query';
import { CountRegisteredClientsUseCase } from '../../../domain/use-cases/count-registered-clients.use-case';

@QueryHandler(CountRegisteredClientsQuery)
export class CountRegisteredClientsQueryHandler
  implements IQueryHandler<CountRegisteredClientsQuery>
{
  constructor(private readonly useCase: CountRegisteredClientsUseCase) {}

  async execute() {
    const total = await this.useCase.execute();
    return { total };
  }
}

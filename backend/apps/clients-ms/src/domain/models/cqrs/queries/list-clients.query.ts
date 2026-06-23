import { Query } from '@nestjs/cqrs';

export class ListClientsQuery extends Query<unknown> {
  constructor(public readonly page: number, public readonly limit: number) {
    super();
  }
}

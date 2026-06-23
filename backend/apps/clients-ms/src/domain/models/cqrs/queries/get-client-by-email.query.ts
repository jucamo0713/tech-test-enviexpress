import { Query } from '@nestjs/cqrs';
import type { Client } from '../../entities/client';

export class GetClientByEmailQuery extends Query<Client> {
  constructor(public readonly email: string) {
    super();
  }
}

import { Query } from '@nestjs/cqrs';
import type { Client } from '../../entities/client';

export class GetClientQuery extends Query<Client> {
  constructor(public readonly id: string) {
    super();
  }
}

import { Query } from '@nestjs/cqrs';
import type { User } from '../../entities/user';

export class GetUserByIdQuery extends Query<User> {
  constructor(public readonly id: string) {
    super();
  }
}

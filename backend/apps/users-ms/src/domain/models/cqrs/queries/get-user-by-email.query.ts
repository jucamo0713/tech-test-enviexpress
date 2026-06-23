import { Query } from '@nestjs/cqrs';
import type { User } from '../../entities/user';

export class GetUserByEmailQuery extends Query<User> {
  constructor(public readonly email: string) {
    super();
  }
}

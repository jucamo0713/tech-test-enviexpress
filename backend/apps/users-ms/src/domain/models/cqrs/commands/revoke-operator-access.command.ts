import { Command } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';

export class RevokeOperatorAccessCommand extends Command<UsersProto.UserResponse> {
  constructor(public readonly id: string) {
    super();
  }
}

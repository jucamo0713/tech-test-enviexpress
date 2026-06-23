import { Command } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';

export class CreateClientUserCommand extends Command<UsersProto.UserResponse> {
  constructor(public readonly payload: UsersProto.CreateClientUserRequest) {
    super();
  }
}

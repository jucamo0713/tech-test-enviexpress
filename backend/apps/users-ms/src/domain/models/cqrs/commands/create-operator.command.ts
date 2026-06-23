import { Command } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';

export class CreateOperatorCommand extends Command<UsersProto.UserResponse> {
  constructor(public readonly payload: UsersProto.CreateOperatorRequest) {
    super();
  }
}

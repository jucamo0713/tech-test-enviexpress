import { Command } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';

export class ChangePasswordCommand extends Command<UsersProto.UserResponse> {
  constructor(public readonly payload: UsersProto.ChangePasswordRequest) {
    super();
  }
}

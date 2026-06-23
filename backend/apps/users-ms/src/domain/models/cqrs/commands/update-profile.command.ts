import { Command } from '@nestjs/cqrs';
import { UsersProto } from 'app/shared';

export class UpdateProfileCommand extends Command<UsersProto.UserResponse> {
  constructor(public readonly payload: UsersProto.UpdateProfileRequest) {
    super();
  }
}

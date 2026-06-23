import { Command } from '@nestjs/cqrs';
import { AuthProto } from 'app/shared';

export class LoginCommand extends Command<AuthProto.AuthResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

import { Command } from '@nestjs/cqrs';
import { AuthProto } from 'app/shared';

export class RegisterClientCommand extends Command<AuthProto.AuthResponse> {
  constructor(public readonly payload: AuthProto.RegisterClientRequest) {
    super();
  }
}

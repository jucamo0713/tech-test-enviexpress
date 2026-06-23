import { Command } from '@nestjs/cqrs';
import { AuthProto } from 'app/shared';

export class RefreshTokenCommand extends Command<AuthProto.AuthResponse> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}

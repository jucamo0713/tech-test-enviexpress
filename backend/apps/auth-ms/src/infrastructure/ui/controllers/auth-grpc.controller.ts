import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  AuthProto,
} from 'app/shared';
import { LoginCommand } from '../../../domain/models/cqrs/commands/login.command';
import { RegisterClientCommand } from '../../../domain/models/cqrs/commands/register-client.command';
import { RefreshTokenCommand } from '../../../domain/models/cqrs/commands/refresh-token.command';

@Controller()
@AuthProto.AuthServiceControllerMethods()
export class AuthGrpcController implements AuthProto.AuthServiceController {
  constructor(private readonly commandBus: CommandBus) {}

  health(_request: AuthProto.HealthRequest): AuthProto.HealthResponse {
    return { status: 'ok' };
  }

  login(request: AuthProto.LoginRequest): Promise<AuthProto.AuthResponse> {
    return this.commandBus.execute<AuthProto.AuthResponse>(
      new LoginCommand(request.email, request.password),
    );
  }

  refresh(
    request: AuthProto.RefreshTokenRequest,
  ): Promise<AuthProto.AuthResponse> {
    return this.commandBus.execute<AuthProto.AuthResponse>(
      new RefreshTokenCommand(request.refreshToken),
    );
  }

  registerClient(
    request: AuthProto.RegisterClientRequest,
  ): Promise<AuthProto.AuthResponse> {
    return this.commandBus.execute(new RegisterClientCommand(request));
  }
}

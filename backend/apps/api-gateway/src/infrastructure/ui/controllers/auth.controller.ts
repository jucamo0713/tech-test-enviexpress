import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  GatewayLoginCommand,
  GatewayRefreshTokenCommand,
  GatewayRegisterClientCommand,
} from '../../../domain/models/cqrs/gateway.messages';
import { LoginRequest } from '../../dtos/auth/login.request';
import { RefreshTokenRequest } from '../../dtos/auth/refresh-token.request';
import { RegisterClientRequest } from '../../dtos/auth/register-client.request';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  login(@Body() request: LoginRequest) {
    return this.commandBus.execute(
      new GatewayLoginCommand(request.email, request.password),
    );
  }

  @Post('refresh')
  refresh(@Body() request: RefreshTokenRequest) {
    return this.commandBus.execute(
      new GatewayRefreshTokenCommand(request.refreshToken),
    );
  }

  @Post('register-client')
  registerClient(@Body() request: RegisterClientRequest) {
    return this.commandBus.execute(
      new GatewayRegisterClientCommand(
        request.trackingCode,
        request.email,
        request.password,
      ),
    );
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { UsersProto } from 'app/shared';
import type { EnvironmentVariables } from 'app/shared';
import type { AuthenticatedUser } from './authenticated-user';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly usersService: UsersProto.UsersServiceClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : typeof request.query.accessToken === 'string'
        ? request.query.accessToken
        : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const user = await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
    const persistedUser = await firstValueFrom(
      this.usersService.getUserById({ id: user.sub }),
    ).catch(() => null);

    if (!persistedUser?.active) {
      throw new UnauthorizedException('Inactive user');
    }

    request.user = user;

    return true;
  }
}

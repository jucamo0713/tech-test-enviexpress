import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import type { EnvironmentVariables } from 'app/shared';
import { UsersProto } from 'app/shared';
import type { AuthUser } from '../models/entities/auth-session';
import { AuthSessionRepository } from '../../infrastructure/driven-adapters/database/auth-session.repository';

export class RefreshTokenUseCase {
  constructor(
    private readonly usersService: UsersProto.UsersServiceClient,
    private readonly sessionRepository: AuthSessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(refreshToken: string) {
    const session = await this.sessionRepository
      .consume(refreshToken)
      .catch(() => null);

    if (!session) throw new UnauthorizedException('Invalid refresh token');

    const user = await firstValueFrom(
      this.usersService.getUserById({ id: session.userId }),
    ).catch(() => null);

    if (!user || !user.active) throw new UnauthorizedException('Invalid refresh token');

    return this.issueTokens(user);
  }

  private async issueTokens(user: UsersProto.UserResponse | AuthUser) {
    const refreshToken = randomUUID();
    await this.sessionRepository.create(user.id, refreshToken);

    return {
      accessToken: await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role, clientId: user.clientId },
        {
          secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
        },
      ),
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
      },
    };
  }
}

import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import type { EnvironmentVariables } from 'app/shared';
import { AuthProto, ClientsProto, PackagesProto, UsersProto } from 'app/shared';
import { AuthSessionRepository } from '../../infrastructure/driven-adapters/database/auth-session.repository';

export class RegisterClientUseCase {
  constructor(
    private readonly packagesService: PackagesProto.PackagesServiceClient,
    private readonly clientsService: ClientsProto.ClientsServiceClient,
    private readonly usersService: UsersProto.UsersServiceClient,
    private readonly sessionRepository: AuthSessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(payload: AuthProto.RegisterClientRequest) {
    const packageRecord = await firstValueFrom(
      this.packagesService.getPackageByTrackingCode({
        trackingCode: payload.trackingCode.toUpperCase(),
      }),
    );
    const client = await firstValueFrom(
      this.clientsService.getClient({ id: packageRecord.clientId }),
    );

    if (client.email.toLowerCase() !== payload.email.toLowerCase()) {
      throw new ForbiddenException('Package does not belong to this email');
    }

    const user = await firstValueFrom(
      this.usersService.createClientUser({
        email: client.email,
        name: client.name,
        clientId: client.id,
        passwordHash: await argon2.hash(payload.password),
      }),
    );

    return this.issueTokens(user);
  }

  private async issueTokens(user: UsersProto.UserResponse) {
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

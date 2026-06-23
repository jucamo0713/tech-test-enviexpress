import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import {
  AuthSessionDocument,
} from './auth-session.schema';
import { DatabaseAuthConfigConstants } from './database-auth-config.constants';

@Injectable()
export class AuthSessionRepository {
  constructor(
    @Inject(DatabaseAuthConfigConstants.AUTH_SESSION_DOCUMENT)
    private readonly sessionModel: Model<AuthSessionDocument>,
  ) {}

  async create(userId: string, refreshToken: string): Promise<void> {
    await this.sessionModel.create({
      id: randomUUID(),
      userId,
      refreshToken,
    });
  }

  async consume(refreshToken: string): Promise<{ userId: string }> {
    const session = await this.sessionModel.findOne({
      refreshToken,
      revokedAt: { $exists: false },
    });

    if (!session) throw new NotFoundException('Refresh token not found');

    session.revokedAt = new Date();
    await session.save();

    return { userId: session.userId };
  }
}

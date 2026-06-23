import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import type { User, UserRole } from '../../../domain/models/entities/user';
import { UserDocument } from './user.schema';
import { DatabaseUserConfigConstants } from './database-user-config.constants';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DatabaseUserConfigConstants.USER_DOCUMENT)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).lean();
    return user ? this.toDomain(user) : null;
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).lean();
    if (!user) throw new NotFoundException('User not found');
    return this.toDomain(user);
  }

  async create(input: {
    id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    clientId?: string;
  }): Promise<User> {
    const created = await this.userModel.create({
      id: input.id ?? randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role,
      clientId: input.clientId,
    });
    return this.toDomain(created);
  }

  private toDomain(user: UserDocument): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role as UserRole,
      clientId: user.clientId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

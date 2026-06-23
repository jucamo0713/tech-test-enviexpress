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

  async listOperators(input: {
    page: number;
    limit: number;
  }): Promise<{ users: User[]; total: number }> {
    const page = Math.max(input.page, 1);
    const limit = Math.min(Math.max(input.limit, 1), 100);
    const [users, total] = await Promise.all([
      this.userModel
        .find({ role: 'operator' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({ role: 'operator' }),
    ]);

    return {
      users: users.map((user) => this.toDomain(user)),
      total,
    };
  }

  async listRegisteredClientIds(clientIds: string[]): Promise<string[]> {
    if (!clientIds.length) return [];

    const users = await this.userModel
      .find({
        role: 'client',
        clientId: { $in: [...new Set(clientIds)] },
      })
      .select({ clientId: 1, _id: 0 })
      .lean();

    return [...new Set(users.flatMap((user) => user.clientId ? [user.clientId] : []))];
  }

  async countRegisteredClients(): Promise<number> {
    const result = await this.userModel.aggregate<{ total: number }>([
      {
        $match: {
          role: 'client',
          clientId: { $exists: true, $ne: null },
        },
      },
      { $group: { _id: '$clientId' } },
      { $count: 'total' },
    ]);

    return result[0]?.total ?? 0;
  }

  async create(input: {
    id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    clientId?: string;
    active?: boolean;
  }): Promise<User> {
    const created = await this.userModel.create({
      id: input.id ?? randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role,
      clientId: input.clientId,
      active: input.active ?? true,
    });
    return this.toDomain(created);
  }

  async revokeOperatorAccess(id: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { id, role: 'operator' },
        { $set: { active: false } },
        { new: true },
      )
      .lean();

    if (!user) throw new NotFoundException('Operator not found');
    return this.toDomain(user);
  }

  async updateProfile(input: {
    id: string;
    name: string;
  }): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { id: input.id },
        { $set: { name: input.name } },
        { new: true },
      )
      .lean();

    if (!user) throw new NotFoundException('User not found');
    return this.toDomain(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { id },
        { $set: { passwordHash } },
        { new: true },
      )
      .lean();

    if (!user) throw new NotFoundException('User not found');
    return this.toDomain(user);
  }

  private toDomain(user: UserDocument): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role as UserRole,
      clientId: user.clientId,
      active: user.active ?? true,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

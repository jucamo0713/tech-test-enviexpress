import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersProto } from 'app/shared';
import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class CreateOperatorUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: UsersProto.CreateOperatorRequest) {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    return this.userRepository.create({
      email: payload.email,
      passwordHash: await argon2.hash(payload.password),
      name: payload.name,
      role: 'operator',
      active: true,
    });
  }
}

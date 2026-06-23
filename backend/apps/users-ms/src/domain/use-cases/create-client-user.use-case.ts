import { ConflictException } from '@nestjs/common';
import { UsersProto } from 'app/shared';
import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class CreateClientUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: UsersProto.CreateClientUserRequest) {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    return this.userRepository.create({
      email: payload.email,
      passwordHash: payload.passwordHash,
      name: payload.name,
      role: 'client',
      clientId: payload.clientId,
    });
  }
}

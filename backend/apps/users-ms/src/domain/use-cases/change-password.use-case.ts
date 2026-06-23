import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersProto } from 'app/shared';
import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: UsersProto.ChangePasswordRequest) {
    const user = await this.userRepository.getById(payload.id);
    const isValidPassword = await argon2.verify(
      user.passwordHash,
      payload.currentPassword,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid current password');
    }

    return this.userRepository.updatePassword(
      payload.id,
      await argon2.hash(payload.newPassword),
    );
  }
}

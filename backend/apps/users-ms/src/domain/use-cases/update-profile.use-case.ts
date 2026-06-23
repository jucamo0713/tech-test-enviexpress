import { UsersProto } from 'app/shared';
import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(payload: UsersProto.UpdateProfileRequest) {
    return this.userRepository.updateProfile({
      id: payload.id,
      name: payload.name,
    });
  }
}

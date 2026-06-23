import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class RevokeOperatorAccessUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(id: string) {
    return this.userRepository.revokeOperatorAccess(id);
  }
}

import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(email: string) {
    return this.userRepository.getByEmail(email);
  }
}

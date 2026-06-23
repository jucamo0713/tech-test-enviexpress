import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(id: string) {
    return this.userRepository.getById(id);
  }
}

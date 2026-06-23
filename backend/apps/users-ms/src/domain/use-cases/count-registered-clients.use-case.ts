import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class CountRegisteredClientsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute() {
    return this.userRepository.countRegisteredClients();
  }
}

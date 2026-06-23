import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class ListRegisteredClientIdsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(clientIds: string[]) {
    return this.userRepository.listRegisteredClientIds(clientIds);
  }
}

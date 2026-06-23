import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';

export class GetClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}
  execute(id: string) {
    return this.clientRepository.get(id);
  }
}

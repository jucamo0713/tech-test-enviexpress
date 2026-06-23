import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';

export class ListClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}
  execute() {
    return this.clientRepository.list();
  }
}

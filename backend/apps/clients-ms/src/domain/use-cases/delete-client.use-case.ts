import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';

export class DeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}
  async execute(id: string) {
    await this.clientRepository.delete(id);
    return { deleted: true };
  }
}

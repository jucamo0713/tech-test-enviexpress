import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';

export class ListClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}
  async execute(page: number, limit: number) {
    const result = await this.clientRepository.listPaginated({ page, limit });
    return {
      clients: result.clients,
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}

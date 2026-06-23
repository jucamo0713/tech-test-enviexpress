import { NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';

export class GetClientByEmailUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(email: string) {
    const client = await this.clientRepository.findByEmail(email);
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }
}

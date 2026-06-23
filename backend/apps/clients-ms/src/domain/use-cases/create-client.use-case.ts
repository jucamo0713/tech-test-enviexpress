import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';
import { CreateClientCommand } from '../models/cqrs/commands/create-client.command';

export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}
  execute(payload: CreateClientCommand['payload']) {
    return this.clientRepository.create(payload);
  }
}

import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';
import { UpdateClientCommand } from '../models/cqrs/commands/update-client.command';

export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}
  execute(id: string, payload: UpdateClientCommand['payload']) {
    return this.clientRepository.update(id, payload);
  }
}

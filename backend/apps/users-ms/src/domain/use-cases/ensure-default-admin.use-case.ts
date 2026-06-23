import * as argon2 from 'argon2';
import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

const SEEDED_CLIENT_ID = '11111111-1111-4111-8111-111111111111';

export class EnsureDefaultAdminUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<void> {
    const existingAdmin = await this.userRepository.findByEmail(
      'admin@enviexpress.test',
    );

    if (!existingAdmin) {
      await this.userRepository.create({
        email: 'admin@enviexpress.test',
        passwordHash: await argon2.hash('Admin123!'),
        name: 'Admin',
        role: 'admin',
      });
    }

    const existingOperator = await this.userRepository.findByEmail(
      'operador@enviexpress.test',
    );

    if (!existingOperator) {
      await this.userRepository.create({
        email: 'operador@enviexpress.test',
        passwordHash: await argon2.hash('Operator123!'),
        name: 'Operador',
        role: 'operator',
      });
    }

    const existingClient = await this.userRepository.findByEmail(
      'cliente@enviexpress.test',
    );

    if (!existingClient) {
      await this.userRepository.create({
        email: 'cliente@enviexpress.test',
        passwordHash: await argon2.hash('Client123!'),
        name: 'Cliente Demo',
        role: 'client',
        clientId: SEEDED_CLIENT_ID,
      });
    }
  }
}

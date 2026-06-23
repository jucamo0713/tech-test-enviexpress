import { ClientRepository } from '../../infrastructure/driven-adapters/database/client.repository';

const SEEDED_CLIENT_ID = '11111111-1111-4111-8111-111111111111';
const REGISTRATION_CLIENT_ID = '22222222-2222-4222-8222-222222222222';

export class EnsureDefaultClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(): Promise<void> {
    await this.ensureClient({
      id: SEEDED_CLIENT_ID,
      name: 'Cliente Demo',
      email: 'cliente@enviexpress.test',
      phone: '+573001112233',
      address: 'Calle 10 # 20-30, Bogota',
    });

    await this.ensureClient({
      id: REGISTRATION_CLIENT_ID,
      name: 'Cliente Registro Demo',
      email: 'registro@enviexpress.test',
      phone: '+573004445566',
      address: 'Carrera 45 # 12-34, Medellin',
    });
  }

  private async ensureClient(input: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  }) {
    const existing = await this.clientRepository.findByEmail(input.email);
    if (existing) return;

    await this.clientRepository.create(input);
  }
}

import type { PackageStatus } from '../state-machine/package-state-machine';
import { PackageRepository } from '../../infrastructure/driven-adapters/database/package.repository';

const SEEDED_CLIENT_ID = '11111111-1111-4111-8111-111111111111';
const REGISTRATION_CLIENT_ID = '22222222-2222-4222-8222-222222222222';
const SEED_ACTOR_ID = 'seed';

export class EnsureDefaultPackagesUseCase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(): Promise<void> {
    await this.ensurePackage({
      id: '33333333-3333-4333-8333-333333333333',
      trackingCode: 'ENV-DEMO-001',
      clientId: SEEDED_CLIENT_ID,
      description: 'Documentos comerciales',
      destinationAddress: 'Calle 10 # 20-30, Bogota',
      status: 'created',
      comment: 'Paquete demo creado',
    });

    await this.ensurePackage({
      id: '44444444-4444-4444-8444-444444444444',
      trackingCode: 'ENV-DEMO-002',
      clientId: SEEDED_CLIENT_ID,
      description: 'Caja pequeña de repuestos',
      destinationAddress: 'Avenida 7 # 45-12, Cali',
      status: 'in_transit',
      comment: 'Paquete demo en transito',
    });

    await this.ensurePackage({
      id: '55555555-5555-4555-8555-555555555555',
      trackingCode: 'ENV-REG-001',
      clientId: REGISTRATION_CLIENT_ID,
      description: 'Paquete para probar registro de cliente',
      destinationAddress: 'Carrera 45 # 12-34, Medellin',
      status: 'received',
      comment: 'Paquete demo para registro',
    });
  }

  private async ensurePackage(input: {
    id: string;
    trackingCode: string;
    clientId: string;
    description: string;
    destinationAddress: string;
    status: PackageStatus;
    comment: string;
  }) {
    const existing = await this.packageRepository.findByTrackingCode(
      input.trackingCode,
    );
    if (existing) return;

    await this.packageRepository.createSeed({
      ...input,
      changedBy: SEED_ACTOR_ID,
    });
  }
}

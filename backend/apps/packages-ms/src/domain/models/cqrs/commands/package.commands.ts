import { Command } from '@nestjs/cqrs';
import type { Package } from '../../entities/package';
import type { PackageStatus } from '../../../state-machine/package-state-machine';

export class CreatePackageCommand extends Command<Package> {
  constructor(
    public readonly payload: {
      clientId: string;
      description: string;
      destinationAddress: string;
      changedBy: string;
    },
  ) { super(); }
}

export class UpdatePackageCommand extends Command<Package> {
  constructor(
    public readonly id: string,
    public readonly payload: Partial<{ description: string; destinationAddress: string }>,
  ) { super(); }
}

export class UpdatePackageStatusCommand extends Command<Package> {
  constructor(
    public readonly payload: {
      id: string;
      status: PackageStatus;
      changedBy: string;
      comment?: string;
    },
  ) { super(); }
}

export class DeletePackageCommand extends Command<{ deleted: boolean }> {
  constructor(public readonly id: string) { super(); }
}

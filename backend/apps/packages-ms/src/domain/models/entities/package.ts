import type { PackageStatus } from '../../state-machine/package-state-machine';

export interface PackageHistory {
  id: string;
  status: PackageStatus;
  comment?: string;
  changedAt: string;
  changedBy: string;
}

export interface Package {
  id: string;
  trackingCode: string;
  clientId: string;
  description: string;
  destinationAddress: string;
  status: PackageStatus;
  history: PackageHistory[];
  createdAt: string;
  updatedAt: string;
}

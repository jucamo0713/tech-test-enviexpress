export interface PackageHistoryItem {
  status: string;
  comment?: string;
  changedAt: string;
  changedBy?: string;
}

export interface PackageItem {
  id: string;
  trackingCode: string;
  clientId: string;
  description: string;
  destinationAddress: string;
  status: string;
  history: PackageHistoryItem[];
}

export interface PaginatedPackages {
  items: PackageItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PackageListFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreatePackageRequest {
  clientId?: string;
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  description: string;
  destinationAddress: string;
}

export interface UpdatePackageStatusRequest {
  status: string;
  comment?: string;
}

export interface UpdatePackageRequest {
  description?: string;
  destinationAddress?: string;
}

export const PACKAGE_STATUS_NAMES: Record<string, string> = {
  created: 'Creado',
  received: 'Recibido',
  in_transit: 'En tránsito',
  failed_delivery: 'Entrega fallida',
  delivered: 'Entregado',
  returned: 'Devuelto',
  cancelled: 'Cancelado',
};

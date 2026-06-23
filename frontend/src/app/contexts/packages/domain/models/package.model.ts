export interface PackageHistoryItem {
  status: string;
  comment?: string;
  changedAt: string;
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
  clientId: string;
  description: string;
  destinationAddress: string;
}

export interface UpdatePackageStatusRequest {
  status: string;
  comment?: string;
}

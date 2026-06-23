export type DashboardPeriod = 'day' | 'week' | 'month' | 'year';

export interface PackageStatusStatItem {
  status: string;
  total: number;
}

export interface PackageStatusStats {
  items: PackageStatusStatItem[];
  total: number;
  startDate: string;
  endDate: string;
}

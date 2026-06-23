export const packageStateTransitions = {
  created: ['received', 'cancelled'],
  received: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'failed_delivery'],
  failed_delivery: ['in_transit', 'returned'],
  delivered: [],
  returned: [],
  cancelled: [],
} as const;

export type PackageStatus = keyof typeof packageStateTransitions;

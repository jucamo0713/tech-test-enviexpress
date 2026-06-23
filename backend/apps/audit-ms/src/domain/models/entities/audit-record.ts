export interface AuditRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  metadata: string;
  createdAt: string;
}

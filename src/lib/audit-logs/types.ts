export const AUDIT_LOG_MODULES = [
  'crm',
  'email',
  'access',
  'settings',
  'website',
  'platform',
  'system',
] as const;

export type AuditLogModule = (typeof AUDIT_LOG_MODULES)[number];

export const AUDIT_LOG_ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'import',
  'other',
] as const;

export type AuditLogAction = (typeof AUDIT_LOG_ACTIONS)[number];

export interface AuditLogMetadata {
  durationMs?: number;
  query?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

export interface AuditLog {
  id: string;
  organizationId: string | null;
  actorUserId: string | null;
  actorName: string;
  actorEmail: string;
  module: AuditLogModule;
  action: AuditLogAction;
  httpMethod: string;
  requestPath: string;
  statusCode: number;
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: AuditLogMetadata;
  createdAt: string;
}

export interface AuditLogsPage {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogsQuery {
  page?: number;
  limit?: number;
  module?: AuditLogModule | '';
  action?: AuditLogAction | '';
  httpMethod?: string;
  actorUserId?: string;
  search?: string;
  from?: string;
  to?: string;
  organizationId?: string;
}

export type AuditLogsScope = 'organization' | 'platform';

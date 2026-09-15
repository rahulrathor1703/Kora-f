import type { AuditLogAction, AuditLogModule } from './types';

export const AUDIT_LOG_MODULE_LABELS: Record<AuditLogModule, string> = {
  crm: 'CRM',
  email: 'Email',
  access: 'Access',
  settings: 'Settings',
  website: 'Website',
  platform: 'Platform',
  system: 'System',
};

export const AUDIT_LOG_MODULE_COLORS: Record<
  AuditLogModule,
  'default' | 'info' | 'warning' | 'primary' | 'error' | 'success'
> = {
  crm: 'primary',
  email: 'info',
  access: 'warning',
  settings: 'default',
  website: 'success',
  platform: 'error',
  system: 'default',
};

export const AUDIT_LOG_ACTION_LABELS: Record<AuditLogAction, string> = {
  read: 'Read',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  login: 'Login',
  logout: 'Logout',
  import: 'Import',
  other: 'Other',
};

export const AUDIT_LOG_ACTION_COLORS: Record<
  AuditLogAction,
  'default' | 'info' | 'warning' | 'primary' | 'error' | 'success'
> = {
  read: 'info',
  create: 'success',
  update: 'warning',
  delete: 'error',
  login: 'primary',
  logout: 'default',
  import: 'primary',
  other: 'default',
};

export const AUDIT_LOG_HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export function formatAuditLogTimestamp(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatAuditLogActor(name: string, email: string): string {
  if (name.trim()) {
    return name.trim();
  }

  return email;
}

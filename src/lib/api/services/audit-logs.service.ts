import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { AuditLogsPage, AuditLogsQuery } from '@/lib/audit-logs/types';

function buildAuditLogsQuery(query: AuditLogsQuery = {}): string {
  const params = new URLSearchParams();

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.limit) {
    params.set('limit', String(query.limit));
  }

  if (query.module) {
    params.set('module', query.module);
  }

  if (query.action) {
    params.set('action', query.action);
  }

  if (query.httpMethod?.trim()) {
    params.set('httpMethod', query.httpMethod.trim());
  }

  if (query.actorUserId) {
    params.set('actorUserId', query.actorUserId);
  }

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.from) {
    params.set('from', new Date(query.from).toISOString());
  }

  if (query.to) {
    params.set('to', new Date(query.to).toISOString());
  }

  if (query.organizationId) {
    params.set('organizationId', query.organizationId);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const auditLogsService = {
  list(query: AuditLogsQuery = {}) {
    return apiClient.get<AuditLogsPage>(
      `${ENDPOINTS.auditLogs.list}${buildAuditLogsQuery(query)}`,
    );
  },

  listPlatform(query: AuditLogsQuery = {}) {
    return apiClient.get<AuditLogsPage>(
      `${ENDPOINTS.auditLogs.platformList}${buildAuditLogsQuery(query)}`,
    );
  },
};

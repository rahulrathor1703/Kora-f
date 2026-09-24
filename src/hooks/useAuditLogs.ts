'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { auditLogsService } from '@/lib/api/services/audit-logs.service';
import type { AuditLogsQuery, AuditLogsScope } from '@/lib/audit-logs/types';

function serializeAuditLogsQuery(query: AuditLogsQuery): string {
  return JSON.stringify({
    page: query.page ?? 1,
    limit: query.limit ?? 50,
    module: query.module ?? '',
    action: query.action ?? '',
    httpMethod: query.httpMethod ?? '',
    actorUserId: query.actorUserId ?? '',
    search: query.search ?? '',
    from: query.from ?? '',
    to: query.to ?? '',
    organizationId: query.organizationId ?? '',
  });
}

interface UseAuditLogsOptions {
  scope?: AuditLogsScope;
  query?: AuditLogsQuery;
  enabled?: boolean;
}

const EMPTY_QUERY: AuditLogsQuery = {};

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const orgScopeKey = useOrgScopeKey();
  const scope = options.scope ?? 'organization';
  const query = options.query ?? EMPTY_QUERY;
  const enabled = options.enabled ?? true;

  const queryKey = useMemo(
    () => `audit-logs.${scope}.${orgScopeKey}.${serializeAuditLogsQuery(query)}`,
    [orgScopeKey, query, scope],
  );

  const fetcher = useMemo(
    () =>
      scope === 'platform'
        ? () => auditLogsService.listPlatform(query)
        : () => auditLogsService.list(query),
    [query, scope],
  );

  const { data, error, isLoading, isFetching, refetch } = useApiQuery(
    queryKey,
    fetcher,
    { enabled },
  );

  return {
    page: data,
    logs: data?.items ?? [],
    total: data?.total ?? 0,
    currentPage: data?.page ?? query.page ?? 1,
    limit: data?.limit ?? query.limit ?? 50,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

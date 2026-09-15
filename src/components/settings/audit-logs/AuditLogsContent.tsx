'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { AuditLogsQuery } from '@/lib/audit-logs/types';
import AuditLogsTable from './AuditLogsTable';

const DEFAULT_QUERY: AuditLogsQuery = {
  page: 1,
  limit: 50,
};

export default function AuditLogsContent() {
  const canRead = useHasPermission('audit-logs:read');
  const [query, setQuery] = useState<AuditLogsQuery>(DEFAULT_QUERY);

  const stableQuery = useMemo(
    () => ({
      page: query.page ?? 1,
      limit: query.limit ?? 50,
      module: query.module || undefined,
      action: query.action || undefined,
      httpMethod: query.httpMethod || undefined,
      actorUserId: query.actorUserId || undefined,
      search: query.search || undefined,
      from: query.from || undefined,
      to: query.to || undefined,
    }),
    [query],
  );

  const { logs, total, currentPage, limit, isLoading, error } = useAuditLogs({
    query: stableQuery,
    enabled: canRead,
  });

  if (!canRead) {
    return (
      <Stack spacing={3}>
        <SettingsSubPageHeader
          overline="Access control"
          title="Audit logs"
          description="Review workspace activity with user-friendly messages for every action."
        />
        <Alert severity="warning">
          You do not have permission to view audit logs.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Access control"
        title="Audit logs"
        description="Review every workspace action with timestamps, actors, modules, and friendly descriptions."
      />

      <AuditLogsTable
        logs={logs}
        total={total}
        page={currentPage}
        limit={limit}
        isLoading={isLoading}
        error={error}
        query={query}
        onQueryChange={setQuery}
      />
    </Stack>
  );
}

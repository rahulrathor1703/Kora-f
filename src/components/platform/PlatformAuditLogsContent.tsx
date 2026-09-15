'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import AuditLogsTable from '@/components/settings/audit-logs/AuditLogsTable';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type { AuditLogsQuery } from '@/lib/audit-logs/types';
import PlatformPageHeader from './PlatformPageHeader';

const DEFAULT_QUERY: AuditLogsQuery = {
  page: 1,
  limit: 50,
};

export default function PlatformAuditLogsContent() {
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
      organizationId: query.organizationId || undefined,
    }),
    [query],
  );

  const { logs, total, currentPage, limit, isLoading, error } = useAuditLogs({
    scope: 'platform',
    query: stableQuery,
  });

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full">
      <Stack spacing={3}>
        <PlatformPageHeader
          overline="Platform administration"
          title="Audit logs"
          description="Cross-tenant audit activity. Filter by organization ID to review a specific workspace."
        />

        <Alert severity="info" className="rounded-2xl">
          {query.organizationId
            ? 'Showing audit entries for the selected organization. Clear the organization ID filter to return to platform-level events.'
            : 'Platform-wide view shows platform-level events only. Enter an organization ID below to inspect a workspace audit trail.'}
        </Alert>

        <AuditLogsTable
          logs={logs}
          total={total}
          page={currentPage}
          limit={limit}
          isLoading={isLoading}
          error={error}
          query={query}
          onQueryChange={setQuery}
          showOrganizationFilter
          showActorFilter={false}
        />
      </Stack>
    </Box>
  );
}

'use client';

import Stack from '@mui/material/Stack';
import { useCallback, useRef, useState } from 'react';
import AnalyticsContent, {
  type AnalyticsContentHandle,
} from '@/components/email/analytics/AnalyticsContent';
import EmailDashboardHeader, {
  EmailDashboardPerformanceError,
} from '@/components/email/dashboard/overview/EmailDashboardHeader';
import EmailDashboardModuleGrid from '@/components/email/dashboard/overview/EmailDashboardModuleGrid';
import EmailDashboardPerformancePanel from '@/components/email/dashboard/overview/EmailDashboardPerformancePanel';
import EmailDashboardQuickActions from '@/components/email/dashboard/overview/EmailDashboardQuickActions';
import { useEmailDashboardSummary } from '@/hooks/useEmailDashboardSummary';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function EmailDashboardOverview() {
  const toOrgPath = useOrgPath();
  const analyticsRef = useRef<AnalyticsContentHandle>(null);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const handleAddWidget = useCallback(() => {
    analyticsRef.current?.openAddWidget();
  }, []);
  const {
    performance,
    moduleSnapshots,
    quickActions,
    modulesLoading,
    performanceError,
  } = useEmailDashboardSummary(toOrgPath);

  return (
    <Stack spacing={3.5}>
      <EmailDashboardHeader
        onAddWidget={handleAddWidget}
        addWidgetDisabled={!widgetsReady}
      />

      {performanceError ? (
        <EmailDashboardPerformanceError message={performanceError} />
      ) : null}

      <EmailDashboardPerformancePanel performance={performance} />
      <EmailDashboardQuickActions actions={quickActions} />
      <EmailDashboardModuleGrid snapshots={moduleSnapshots} isLoading={modulesLoading} />
      <AnalyticsContent
        ref={analyticsRef}
        variant="embedded"
        hideEmptyState
        onDashboardReady={setWidgetsReady}
      />
    </Stack>
  );
}

'use client';

import type { SvgIconComponent } from '@mui/icons-material';
import { useMemo } from 'react';
import { useSession } from '@/hooks/useAuth';
import { useAnalyticsWidgetData } from '@/hooks/useAnalyticsDashboards';
import { useCampaignOverviewMetrics } from '@/hooks/useCampaignOverviewMetrics';
import {
  useEmailExcluded,
  useEmailExcludedListContacts,
} from '@/hooks/useEmailExcluded';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useInboxReplies } from '@/hooks/useInboxReplies';
import { useMailboxes } from '@/hooks/useMailboxes';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import type { AnalyticsFilters } from '@/lib/email/analytics/types';
import { buildAudienceHubHref } from '@/lib/email/audience-tabs';
import {
  buildSendVolumePanelView,
  type SendVolumePanelView,
} from '@/lib/email/dashboard/send-volume-panel';
import { buildOrgSendVolumeTrendPoints } from '@/lib/email/dashboard/send-volume-trend';
import {
  countCampaignsByStatus,
  formatDashboardCount,
  getAnalyticsChartDateFilters,
  summarizeMailboxHealth,
} from '@/lib/email/dashboard/summary';
import type { DeliveryTrendPoint } from '@/lib/email/campaigns/delivery-trend-chart-utils';
import { getDeliveryTrendMaxValue } from '@/lib/email/campaigns/delivery-trend-chart-utils';
import { emailPrimaryTabs } from '@/lib/email/navigation';
import { hasNavPermission } from '@/lib/workspace-navigation';

export interface EmailDashboardMetric {
  label: string;
  value: string;
}

export interface EmailDashboardModuleSnapshot {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: SvgIconComponent;
  metrics: EmailDashboardMetric[];
  badge?: string;
  showNotificationDot?: boolean;
}

export interface EmailDashboardQuickActionItem {
  title: string;
  subtext: string;
  href: string;
}

export interface EmailDashboardPerformance {
  totalSent: number;
  deliverability: number;
  openRate: number;
  ctr: number;
  isLoading: boolean;
  chartLoading: boolean;
  deliveryTrendPoints: DeliveryTrendPoint[];
  trendAxisReference: number;
  sendVolumeChipLabel: string;
  sendVolumePanel: SendVolumePanelView;
}

export function useEmailDashboardSummary(toOrgPath: (path: string) => string) {
  const { data: session } = useSession();
  const permissions = useMemo(
    () => session?.permissions ?? [],
    [session?.permissions],
  );
  const isSuperAdmin = isPlatformOwner(session);

  const canReadMailboxes = useHasPermission('mailboxes:read');

  const chartFilters = useMemo(() => getAnalyticsChartDateFilters(), []);
  const monthlySendFilters = useMemo(
    (): AnalyticsFilters => ({
      dateFrom: chartFilters.dateFrom,
      dateTo: chartFilters.dateTo,
    }),
    [chartFilters.dateFrom, chartFilters.dateTo],
  );

  const performanceMetrics = useCampaignOverviewMetrics();
  const sentByMonthQuery = useAnalyticsWidgetData(
    'total_sent',
    'month',
    monthlySendFilters,
    monthlySendFilters,
    true,
  );
  const openedByMonthQuery = useAnalyticsWidgetData(
    'total_opened',
    'month',
    monthlySendFilters,
    monthlySendFilters,
    true,
  );
  const clickedByMonthQuery = useAnalyticsWidgetData(
    'total_clicks',
    'month',
    monthlySendFilters,
    monthlySendFilters,
    true,
  );
  const repliedByMonthQuery = useAnalyticsWidgetData(
    'total_replied',
    'month',
    monthlySendFilters,
    monthlySendFilters,
    true,
  );
  const bouncedByMonthQuery = useAnalyticsWidgetData(
    'total_bounced',
    'month',
    monthlySendFilters,
    monthlySendFilters,
    true,
  );

  const chartQueriesLoading =
    sentByMonthQuery.isLoading ||
    openedByMonthQuery.isLoading ||
    clickedByMonthQuery.isLoading ||
    repliedByMonthQuery.isLoading ||
    bouncedByMonthQuery.isLoading;

  const deliveryTrendPoints = useMemo(
    () =>
      buildOrgSendVolumeTrendPoints({
        sentPoints: sentByMonthQuery.data?.points ?? [],
        openedPoints: openedByMonthQuery.data?.points ?? [],
        clickedPoints: clickedByMonthQuery.data?.points ?? [],
        repliedPoints: repliedByMonthQuery.data?.points ?? [],
        bouncedPoints: bouncedByMonthQuery.data?.points ?? [],
      }),
    [
      bouncedByMonthQuery.data?.points,
      clickedByMonthQuery.data?.points,
      openedByMonthQuery.data?.points,
      repliedByMonthQuery.data?.points,
      sentByMonthQuery.data?.points,
    ],
  );

  const trendAxisReference = useMemo(() => {
    const peakMetric = getDeliveryTrendMaxValue(deliveryTrendPoints);
    return Math.max(performanceMetrics.totalSent, peakMetric, 1);
  }, [deliveryTrendPoints, performanceMetrics.totalSent]);

  const { campaigns, isLoading: campaignsLoading } = useEmailCampaigns();
  const { addresses: excludedAddresses, isLoading: excludedLoading } =
    useEmailExcluded();
  const listContactsQuery = useEmailExcludedListContacts({
    page: 1,
    limit: 1,
    enabled: true,
  });
  const inboxQuery = useInboxReplies({ page: 1, limit: 1 });
  const { mailboxes, isLoading: mailboxesLoading } = useMailboxes();
  const campaignCounts = useMemo(
    () => countCampaignsByStatus(campaigns),
    [campaigns],
  );
  const mailboxHealth = useMemo(
    () => summarizeMailboxHealth(mailboxes),
    [mailboxes],
  );

  const moduleSnapshots = useMemo((): EmailDashboardModuleSnapshot[] => {
    const snapshots: EmailDashboardModuleSnapshot[] = [];

    const campaignsTab = emailPrimaryTabs.find(
      (tab) => tab.href === '/email/campaigns',
    );
    if (
      campaignsTab &&
      hasNavPermission(campaignsTab, permissions, isSuperAdmin)
    ) {
      snapshots.push({
        id: 'campaigns',
        title: campaignsTab.label,
        description: campaignsTab.description ?? '',
        href: toOrgPath('/email/campaigns'),
        icon: campaignsTab.icon,
        metrics: [
          {
            label: 'Total campaigns',
            value: formatDashboardCount(campaignCounts.total),
          },
          {
            label: 'Draft',
            value: formatDashboardCount(campaignCounts.draft),
          },
          {
            label: 'Scheduled',
            value: formatDashboardCount(campaignCounts.scheduled),
          },
          {
            label: 'Sending',
            value: formatDashboardCount(campaignCounts.sending),
          },
        ],
      });
    }

    const audienceTab = emailPrimaryTabs.find((tab) => tab.href === '/email/lists');
    if (
      audienceTab &&
      hasNavPermission(audienceTab, permissions, isSuperAdmin)
    ) {
      snapshots.push({
        id: 'audience-contacts',
        title: 'Contacts',
        description: 'Deduplicated contacts across all lists.',
        href: toOrgPath(buildAudienceHubHref('contacts', (path) => path)),
        icon: audienceTab.icon,
        metrics: [
          {
            label: 'All contacts',
            value: formatDashboardCount(listContactsQuery.data?.total ?? 0),
          },
        ],
      });
    }

    const fixSpamTab = emailPrimaryTabs.find(
      (tab) => tab.href === '/email/fix-spam',
    );
    if (
      fixSpamTab &&
      canReadMailboxes &&
      hasNavPermission(fixSpamTab, permissions, isSuperAdmin)
    ) {
      snapshots.push({
        id: 'fix-spam',
        title: fixSpamTab.label,
        description: fixSpamTab.description ?? '',
        href: toOrgPath('/email/fix-spam'),
        icon: fixSpamTab.icon,
        metrics: [
          {
            label: 'Needs attention',
            value: formatDashboardCount(mailboxHealth.needsFixSpamAttention),
          },
          {
            label: 'Poor spam score',
            value: formatDashboardCount(mailboxHealth.poorSpamScore),
          },
        ],
      });
    }

    if (
      audienceTab &&
      hasNavPermission(audienceTab, permissions, isSuperAdmin)
    ) {
      snapshots.push({
        id: 'audience-excluded',
        title: 'Excluded',
        description: 'Globally suppressed addresses.',
        href: toOrgPath(buildAudienceHubHref('excluded', (path) => path)),
        icon: audienceTab.icon,
        metrics: [
          {
            label: 'Suppressed',
            value: formatDashboardCount(excludedAddresses?.length ?? 0),
          },
        ],
      });
    }

    return snapshots;
  }, [
    campaignCounts.draft,
    campaignCounts.scheduled,
    campaignCounts.sending,
    campaignCounts.total,
    canReadMailboxes,
    excludedAddresses?.length,
    isSuperAdmin,
    listContactsQuery.data?.total,
    mailboxHealth.needsFixSpamAttention,
    mailboxHealth.poorSpamScore,
    permissions,
    toOrgPath,
  ]);

  const quickActions = useMemo((): EmailDashboardQuickActionItem[] => {
    const actions: EmailDashboardQuickActionItem[] = [];

    const campaignsTab = emailPrimaryTabs.find(
      (tab) => tab.href === '/email/campaigns',
    );
    if (
      campaignsTab &&
      hasNavPermission(campaignsTab, permissions, isSuperAdmin)
    ) {
      actions.push({
        title: 'Create campaign',
        subtext: 'Start a new outreach flow',
        href: toOrgPath('/email/campaigns/new'),
      });
    }

    const audienceTab = emailPrimaryTabs.find((tab) => tab.href === '/email/lists');
    if (
      audienceTab &&
      hasNavPermission(audienceTab, permissions, isSuperAdmin)
    ) {
      actions.push({
        title: 'Add list',
        subtext: 'Import or build an audience',
        href: toOrgPath('/email/lists/new'),
      });
    }

    const inboxTab = emailPrimaryTabs.find((tab) => tab.href === '/email/inbox');
    if (inboxTab && hasNavPermission(inboxTab, permissions, isSuperAdmin)) {
      actions.push({
        title: 'Open inbox',
        subtext: `${formatDashboardCount(inboxQuery.data?.total ?? 0)} replies`,
        href: toOrgPath('/email/inbox'),
      });
    }

    const mailboxesTab = emailPrimaryTabs.find(
      (tab) => tab.href === '/email/mailboxes',
    );
    if (
      mailboxesTab &&
      canReadMailboxes &&
      hasNavPermission(mailboxesTab, permissions, isSuperAdmin)
    ) {
      actions.push({
        title: 'Manage mailboxes',
        subtext: `${formatDashboardCount(mailboxHealth.active)} active senders`,
        href: toOrgPath('/email/mailboxes'),
      });
    }

    return actions.slice(0, 4);
  }, [
    canReadMailboxes,
    inboxQuery.data?.total,
    isSuperAdmin,
    mailboxHealth.active,
    permissions,
    toOrgPath,
  ]);

  const sendVolumePanel = useMemo(
    () =>
      buildSendVolumePanelView({
        totalSent: performanceMetrics.totalSent,
        deliverability: performanceMetrics.deliverability,
        openRate: performanceMetrics.openRate,
        ctr: performanceMetrics.ctr,
        sentPoints: sentByMonthQuery.data?.points ?? [],
        openedPoints: openedByMonthQuery.data?.points ?? [],
        clickedPoints: clickedByMonthQuery.data?.points ?? [],
        bouncedPoints: bouncedByMonthQuery.data?.points ?? [],
      }),
    [
      bouncedByMonthQuery.data?.points,
      clickedByMonthQuery.data?.points,
      openedByMonthQuery.data?.points,
      performanceMetrics.ctr,
      performanceMetrics.deliverability,
      performanceMetrics.openRate,
      performanceMetrics.totalSent,
      sentByMonthQuery.data?.points,
    ],
  );

  const performance: EmailDashboardPerformance = {
    totalSent: performanceMetrics.totalSent,
    deliverability: performanceMetrics.deliverability,
    openRate: performanceMetrics.openRate,
    ctr: performanceMetrics.ctr,
    isLoading: performanceMetrics.isLoading,
    chartLoading: chartQueriesLoading,
    deliveryTrendPoints,
    trendAxisReference,
    sendVolumeChipLabel: 'Last 12 months',
    sendVolumePanel,
  };

  const modulesLoading =
    campaignsLoading ||
    excludedLoading ||
    listContactsQuery.isLoading ||
    (canReadMailboxes && mailboxesLoading);

  return {
    performance,
    moduleSnapshots,
    quickActions,
    modulesLoading,
    performanceError:
      performanceMetrics.error ??
      sentByMonthQuery.error ??
      openedByMonthQuery.error ??
      clickedByMonthQuery.error ??
      repliedByMonthQuery.error ??
      bouncedByMonthQuery.error,
  };
}

'use client';

import { useAnalyticsWidgetData } from '@/hooks/useAnalyticsDashboards';

const EMPTY_FILTERS = {};

export function useCampaignOverviewMetrics() {
  const totalSentQuery = useAnalyticsWidgetData(
    'total_sent',
    'campaign',
    EMPTY_FILTERS,
    EMPTY_FILTERS,
    true,
  );

  const deliverabilityQuery = useAnalyticsWidgetData(
    'deliverability',
    'campaign',
    EMPTY_FILTERS,
    EMPTY_FILTERS,
    true,
  );

  const openRateQuery = useAnalyticsWidgetData(
    'open_rate',
    'campaign',
    EMPTY_FILTERS,
    EMPTY_FILTERS,
    true,
  );

  const ctrQuery = useAnalyticsWidgetData(
    'ctr',
    'campaign',
    EMPTY_FILTERS,
    EMPTY_FILTERS,
    true,
  );

  const isLoading =
    totalSentQuery.isLoading ||
    deliverabilityQuery.isLoading ||
    openRateQuery.isLoading ||
    ctrQuery.isLoading;

  const error =
    totalSentQuery.error ??
    deliverabilityQuery.error ??
    openRateQuery.error ??
    ctrQuery.error;

  return {
    totalSent: totalSentQuery.data?.total ?? 0,
    deliverability: deliverabilityQuery.data?.total ?? 0,
    openRate: openRateQuery.data?.total ?? 0,
    ctr: ctrQuery.data?.total ?? 0,
    isLoading,
    error,
  };
}

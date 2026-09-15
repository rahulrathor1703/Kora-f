'use client';

import { useMemo } from 'react';
import { emailCampaignService } from '@/lib/api';
import type { EmailCampaignListMetricsRecord } from '@/lib/email/campaigns/list-metrics-types';
import { useApiQuery } from '@/hooks/api';

export function useCampaignListMetrics() {
  const { data, error, isLoading, refetch } = useApiQuery(
    'email-campaigns.metrics-summary',
    () => emailCampaignService.getMetricsSummary(),
    { refetchIntervalMs: 30_000 },
  );

  const metricsByCampaignId = useMemo(() => {
    const map = new Map<string, EmailCampaignListMetricsRecord>();

    for (const record of data ?? []) {
      map.set(record.campaignId, record);
    }

    return map;
  }, [data]);

  return {
    metricsByCampaignId,
    isLoading,
    error,
    refetch,
  };
}

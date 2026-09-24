'use client';

import { useApiQuery } from '@/hooks/api';
import { emailCampaignService } from '@/lib/api/services/email-campaign.service';

export function useMergeFieldCatalog() {
  const { data, error, isLoading, refetch } = useApiQuery(
    'emailCampaigns.mergeFieldCatalog',
    () => emailCampaignService.getMergeFieldCatalog(),
  );

  return {
    catalog: data ?? { groups: [] },
    isLoading,
    error,
    refetch,
  };
}

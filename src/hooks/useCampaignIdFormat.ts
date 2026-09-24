'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { campaignIdFormatService } from '@/lib/api/services/campaign-id-format.service';
import type { SetCampaignIdFormatInput } from '@/lib/email/campaign-id-format/types';

export function useCampaignIdFormat(enabled = true) {
  const orgScopeKey = useOrgScopeKey();

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery(
    `email-campaign-id-format.${orgScopeKey}`,
    () => campaignIdFormatService.getFormat(),
    { enabled },
  );

  const {
    mutate: setFormatMutate,
    isLoading: isSettingFormat,
    error: setFormatError,
  } = useApiMutation(campaignIdFormatService.setFormat);

  const setFormat = useCallback(
    async (input: SetCampaignIdFormatInput) => {
      const result = await setFormatMutate(input);
      await refetch();
      return result;
    },
    [refetch, setFormatMutate],
  );

  return {
    data: data ?? null,
    isLoading,
    error,
    setFormat,
    isSettingFormat,
    setFormatError,
    refetch,
  };
}

'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { bantSettingsService } from '@/lib/api/services/bant-settings.service';
import type { BantResponses } from '@/lib/crm/bant/types';

export function useProspectBant(prospectId: string) {
  const orgScopeKey = useOrgScopeKey();

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery(
    `prospects.bant.${orgScopeKey}.${prospectId}`,
    () => bantSettingsService.getProspectBant(prospectId),
    { enabled: prospectId.trim().length > 0 },
  );

  const {
    mutate: updateMutate,
    isLoading: isSaving,
    error: saveError,
  } = useApiMutation(
    (responses: BantResponses) =>
      bantSettingsService.updateProspectBant(prospectId, { responses }),
  );

  const saveResponses = useCallback(
    async (responses: BantResponses) => {
      const result = await updateMutate(responses);
      await refetch();
      return result;
    },
    [refetch, updateMutate],
  );

  return {
    data,
    config: data?.config ?? null,
    responses: data?.responses ?? {},
    computedScore: data?.computedScore ?? null,
    computedTier: data?.computedTier ?? null,
    isLoading,
    isSaving,
    error: error ?? saveError,
    saveResponses,
    refetch,
  };
}

'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { bantSettingsService } from '@/lib/api/services/bant-settings.service';
import type { UpdateBantSettingsInput } from '@/lib/crm/bant/types';

export function useBantSettings() {
  const orgScopeKey = useOrgScopeKey();

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery(`bant-settings.${orgScopeKey}`, () =>
    bantSettingsService.getSettings(),
  );

  const {
    mutate: updateMutate,
    isLoading: isSaving,
    error: saveError,
  } = useApiMutation(bantSettingsService.updateSettings);

  const saveSettings = useCallback(
    async (input: UpdateBantSettingsInput) => {
      const result = await updateMutate(input);
      await refetch();
      return result;
    },
    [refetch, updateMutate],
  );

  return {
    settings: data ?? null,
    config: data?.config ?? null,
    isLoading,
    isSaving,
    error: error ?? saveError,
    saveSettings,
    refetch,
  };
}

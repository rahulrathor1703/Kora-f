'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { websiteService } from '@/lib/api/services/website.service';
import type { UpdateGoogleOAuthAppSettingsInput } from '@/lib/api/services/website.service';

export function useWebsiteGoogleOAuthSettings() {
  const orgScopeKey = 'website.googleOAuthAppSettings';

  const query = useApiQuery(`${orgScopeKey}.get`, () =>
    websiteService.getGoogleOAuthAppSettings(),
  );

  const { mutate: updateMutate, isLoading: isSaving } = useApiMutation(
    (input: UpdateGoogleOAuthAppSettingsInput) =>
      websiteService.updateGoogleOAuthAppSettings(input),
  );

  const updateSettings = useCallback(
    async (input: UpdateGoogleOAuthAppSettingsInput) => {
      const result = await updateMutate(input);
      await query.refetch();
      return result;
    },
    [query, updateMutate],
  );

  return {
    settings: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateSettings,
    isSaving,
  };
}

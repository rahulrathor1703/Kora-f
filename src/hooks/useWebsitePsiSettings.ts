'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { websiteService } from '@/lib/api/services/website.service';
import type {
  TestPsiSettingsInput,
  UpdatePsiSettingsInput,
} from '@/lib/api/services/website.service';

export function useWebsitePsiSettings() {
  const orgScopeKey = 'website.psiSettings';

  const query = useApiQuery(`${orgScopeKey}.get`, () =>
    websiteService.getPsiSettings(),
  );

  const { mutate: updateMutate, isLoading: isSaving } = useApiMutation(
    (input: UpdatePsiSettingsInput) => websiteService.updatePsiSettings(input),
  );

  const { mutate: testMutate, isLoading: isTesting } = useApiMutation(
    (input: TestPsiSettingsInput) => websiteService.testPsiSettings(input),
  );

  const updateSettings = useCallback(
    async (input: UpdatePsiSettingsInput) => {
      const result = await updateMutate(input);
      await query.refetch();
      return result;
    },
    [query, updateMutate],
  );

  const testSettings = useCallback(
    (input: TestPsiSettingsInput = {}) => testMutate(input),
    [testMutate],
  );

  return {
    settings: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateSettings,
    testSettings,
    isSaving,
    isTesting,
  };
}

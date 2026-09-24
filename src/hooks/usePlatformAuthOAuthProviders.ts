'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import {
  listPlatformAuthOAuthProviders,
  updatePlatformAuthOAuthProvider,
  type PlatformAuthOAuthProvider,
} from '@/lib/api/platform';

export function usePlatformAuthOAuthProviders() {
  const query = useApiQuery('platform.authOAuth.list', listPlatformAuthOAuthProviders);

  const { mutate, isLoading: isSaving } = useApiMutation(
    ({
      provider,
      input,
    }: {
      provider: 'google' | 'apple';
      input: { enabled?: boolean; clientId?: string | null };
    }) => updatePlatformAuthOAuthProvider(provider, input),
  );

  const saveProvider = useCallback(
    async (
      provider: 'google' | 'apple',
      input: { enabled?: boolean; clientId?: string | null },
    ): Promise<PlatformAuthOAuthProvider> => {
      const result = await mutate({ provider, input });
      await query.refetch();
      return result;
    },
    [mutate, query],
  );

  return {
    providers: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    saveProvider,
    isSaving,
  };
}

'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { websiteService } from '@/lib/api/services/website.service';
import type {
  CreateGoogleOAuthAppInput,
  UpdateGoogleOAuthAppInput,
} from '@/lib/api/services/website.service';

export function useOrganizationGoogleOAuthApps() {
  const query = useApiQuery('website.googleOAuthApps', () =>
    websiteService.listGoogleOAuthApps(),
  );

  const { mutate: createMutate, isLoading: isCreating } = useApiMutation(
    (input: CreateGoogleOAuthAppInput) => websiteService.createGoogleOAuthApp(input),
  );

  const { mutate: updateMutate, isLoading: isUpdating } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateGoogleOAuthAppInput }) =>
      websiteService.updateGoogleOAuthApp(id, input),
  );

  const { mutate: deleteMutate, isLoading: isDeleting } = useApiMutation(
    (id: string) => websiteService.deleteGoogleOAuthApp(id),
  );

  const createApp = useCallback(
    async (input: CreateGoogleOAuthAppInput) => {
      const result = await createMutate(input);
      await query.refetch();
      return result;
    },
    [createMutate, query],
  );

  const updateApp = useCallback(
    async (id: string, input: UpdateGoogleOAuthAppInput) => {
      const result = await updateMutate({ id, input });
      await query.refetch();
      return result;
    },
    [query, updateMutate],
  );

  const deleteApp = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await query.refetch();
    },
    [deleteMutate, query],
  );

  return {
    apps: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createApp,
    updateApp,
    deleteApp,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

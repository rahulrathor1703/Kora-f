'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { websiteService } from '@/lib/api/services/website.service';

export function useOrganizationGoogleConnections(oauthAppId?: string | null) {
  const queryKey = oauthAppId
    ? `website.organizationGoogleConnections.${oauthAppId}`
    : 'website.organizationGoogleConnections';

  const query = useApiQuery(queryKey, () =>
    websiteService.listOrganizationGoogleConnections(oauthAppId ?? undefined),
  );

  const { mutate: deleteMutate, isLoading: isDeleting } = useApiMutation(
    (connectionId: string) =>
      websiteService.deleteOrganizationGoogleConnection(connectionId),
  );

  const deleteConnection = useCallback(
    async (connectionId: string) => {
      await deleteMutate(connectionId);
      await query.refetch();
    },
    [deleteMutate, query],
  );

  return {
    connections: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    deleteConnection,
    isDeleting,
  };
}

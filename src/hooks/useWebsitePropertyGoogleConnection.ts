'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { websiteService } from '@/lib/api/services/website.service';

export function useWebsitePropertyGoogleConnection(propertyId: string | null) {
  const scopeKey = propertyId
    ? `website.propertyGoogleConnection.${propertyId}`
    : 'website.propertyGoogleConnection.none';

  const connectionQuery = useApiQuery(
    `${scopeKey}.connection`,
    () => websiteService.getPropertyGoogleConnection(propertyId!),
    { enabled: Boolean(propertyId) },
  );

  const availabilityQuery = useApiQuery('website.googleConnection.availability', () =>
    websiteService.getGoogleConnectionAvailability(),
  );

  const { mutate: disconnectMutate, isLoading: isDisconnecting } = useApiMutation(() =>
    websiteService.disconnectPropertyGoogle(propertyId!),
  );

  const disconnect = useCallback(async () => {
    if (!propertyId) {
      return;
    }

    await disconnectMutate(undefined);
    await connectionQuery.refetch();
  }, [connectionQuery, disconnectMutate, propertyId]);

  return {
    connection: connectionQuery.data ?? null,
    availability: availabilityQuery.data,
    isLoading: connectionQuery.isLoading || availabilityQuery.isLoading,
    refetch: connectionQuery.refetch,
    disconnect,
    isDisconnecting,
  };
}

export function useGoogleConnectionAvailability() {
  const availabilityQuery = useApiQuery('website.googleConnection.availability', () =>
    websiteService.getGoogleConnectionAvailability(),
  );

  return {
    availability: availabilityQuery.data,
    isLoading: availabilityQuery.isLoading,
  };
}

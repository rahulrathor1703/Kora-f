'use client';

import { useDeferredValue } from 'react';
import { useApiQuery } from '@/hooks/api';
import { websiteService } from '@/lib/api/services/website.service';

export function useGooglePropertySuggestions(
  url: string,
  options: {
    propertyId?: string | null;
    connectionId?: string | null;
    enabled?: boolean;
  },
) {
  const deferredUrl = useDeferredValue(url);
  const trimmed = deferredUrl.trim();
  const propertyId = options.propertyId ?? null;
  const connectionId = options.connectionId ?? null;
  const enabled = options.enabled ?? true;
  const shouldFetch =
    enabled &&
    Boolean(propertyId || connectionId) &&
    trimmed.length >= 3;

  const query = useApiQuery(
    `website.googleSuggestions.${propertyId ?? 'none'}.${connectionId ?? 'none'}.${trimmed}`,
    () =>
      websiteService.getGooglePropertySuggestions(trimmed, {
        propertyId: propertyId ?? undefined,
        connectionId: connectionId ?? undefined,
      }),
    { enabled: shouldFetch },
  );

  return {
    suggestions: shouldFetch ? query.data : null,
    isLoading: shouldFetch && query.isLoading,
    error: shouldFetch ? query.error : null,
    refetch: query.refetch,
  };
}

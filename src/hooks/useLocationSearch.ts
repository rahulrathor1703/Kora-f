'use client';

import { useApiQuery } from '@/hooks/api';
import {
  locationSearchService,
  locationSettingsService,
} from '@/lib/api/services/location.service';
import type { LocationComponent } from '@/lib/crm/location/types';

export function useLocationSearch(
  query: string,
  components: LocationComponent[],
  trigger: LocationComponent | null,
  enabled: boolean,
) {
  const trimmed = query.trim();
  const queryKey = [
    'location-search',
    trimmed,
    components.join(','),
    trigger ?? '',
  ].join('.');

  const result = useApiQuery(
    queryKey,
    () =>
      locationSearchService.search(
        trimmed,
        components,
        trigger as LocationComponent,
      ),
    {
      enabled:
        enabled &&
        trimmed.length >= 2 &&
        components.length > 0 &&
        trigger !== null,
    },
  );

  return {
    ...result,
    data: result.data ?? [],
    isFetching: result.isLoading,
  };
}

export function useLocationApiStatus() {
  return useApiQuery('location-api-status', () => locationSearchService.status());
}

export function useLocationSettings() {
  return useApiQuery('location-settings', () => locationSettingsService.get());
}

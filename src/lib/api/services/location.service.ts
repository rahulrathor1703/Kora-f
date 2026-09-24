import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { LocationComponent } from '@/lib/crm/location/types';

export type LocationProvider = 'geonames' | 'custom';

export interface LocationSettings {
  provider: LocationProvider;
  apiUrl: string | null;
  apiUsernameMasked: string | null;
  apiKeyMasked: string | null;
  isConfigured: boolean;
  usesPlatformDefault: boolean;
}

export interface UpdateLocationSettingsInput {
  provider: LocationProvider;
  apiUsername?: string;
  apiUrl?: string;
  apiKey?: string;
}

export interface TestLocationSettingsInput {
  provider: LocationProvider;
  apiUsername?: string;
  apiUrl?: string;
  apiKey?: string;
}

export interface LocationSearchResult {
  city?: string;
  state?: string;
  country?: string;
  region?: string;
  displayLabel: string;
}

export const locationSettingsService = {
  get() {
    return apiClient.get<LocationSettings>(ENDPOINTS.locationSettings.root);
  },

  update(input: UpdateLocationSettingsInput) {
    return apiClient.put<LocationSettings>(
      ENDPOINTS.locationSettings.root,
      input,
    );
  },

  test(input: TestLocationSettingsInput) {
    return apiClient.post<{ ok: true }>(ENDPOINTS.locationSettings.test, input);
  },
};

export const locationSearchService = {
  search(
    query: string,
    components: LocationComponent[],
    trigger: LocationComponent,
  ) {
    const params = new URLSearchParams({
      q: query,
      components: components.join(','),
      trigger,
    });

    return apiClient.get<LocationSearchResult[]>(
      `${ENDPOINTS.location.search}?${params.toString()}`,
    );
  },

  status() {
    return apiClient.get<{ isConfigured: boolean }>(ENDPOINTS.location.status);
  },
};

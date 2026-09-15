import type { AnalyticsFilters } from '@/lib/email/analytics/types';

export function buildFilterQuery(filters: AnalyticsFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.brandId) {
    params.set('brandId', filters.brandId);
  }

  if (filters.regionId) {
    params.set('regionId', filters.regionId);
  }

  if (filters.campaignTypeId) {
    params.set('campaignTypeId', filters.campaignTypeId);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return suffix;
}

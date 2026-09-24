import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateWebsitePropertyInput,
  OnPageAuditRun,
  OnPageAuditsQuery,
  OnPagePageResultsQuery,
  PaginatedOnPageAudits,
  PaginatedOnPagePageResults,
  UpdateWebsitePropertyInput,
  WebsiteProperty,
} from '@/lib/website/on-page-seo/types';

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const onPageSeoService = {
  getProperties() {
    return apiClient.get<WebsiteProperty[]>(ENDPOINTS.website.properties);
  },

  createProperty(input: CreateWebsitePropertyInput) {
    return apiClient.post<WebsiteProperty>(ENDPOINTS.website.properties, input);
  },

  updateProperty(id: string, input: UpdateWebsitePropertyInput) {
    return apiClient.patch<WebsiteProperty>(ENDPOINTS.website.property(id), input);
  },

  deleteProperty(id: string) {
    return apiClient.delete<void>(ENDPOINTS.website.property(id));
  },

  listAudits(query: OnPageAuditsQuery = {}) {
    const qs = buildQueryString({
      websitePropertyId: query.websitePropertyId,
      page: query.page,
      pageSize: query.pageSize,
    });
    return apiClient.get<PaginatedOnPageAudits>(
      `${ENDPOINTS.website.onPageAudits}${qs}`,
    );
  },

  getAudit(id: string) {
    return apiClient.get<OnPageAuditRun>(ENDPOINTS.website.onPageAudit(id));
  },

  listPageResults(auditId: string, query: OnPagePageResultsQuery = {}) {
    const qs = buildQueryString({
      page: query.page,
      pageSize: query.pageSize,
      hasIssuesOnly: query.hasIssuesOnly,
      thinContentOnly: query.thinContentOnly,
      minScore: query.minScore,
      maxScore: query.maxScore,
    });
    return apiClient.get<PaginatedOnPagePageResults>(
      `${ENDPOINTS.website.onPageAuditPages(auditId)}${qs}`,
    );
  },

  triggerAudit(propertyId?: string) {
    return apiClient.post<OnPageAuditRun[]>(ENDPOINTS.website.triggerOnPageAudit, {
      propertyId,
    });
  },
};

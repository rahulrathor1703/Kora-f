import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export interface EmailExcludedAddress {
  id: string;
  email: string;
  reason: string;
  sourceCampaignId: string | null;
  createdAt: string;
}

export type EmailExcludedListType = 'contact' | 'manual';

export interface ExcludeFromListResult {
  excludedCount: number;
  totalCount: number;
}

export interface EmailExcludedListContact {
  email: string;
  name: string;
  listNames: string[];
  isExcluded: boolean;
  isUnassigned: boolean;
}

export interface AssignAudienceContactToListInput {
  email: string;
  listId: string;
  listType: EmailExcludedListType;
}

export interface EmailExcludedListContactsPage {
  items: EmailExcludedListContact[];
  total: number;
  page: number;
  limit: number;
}

export interface EmailExcludedListContactsQuery {
  search?: string;
  page?: number;
  limit?: number;
  includeManual?: boolean;
}

export interface CreateAudienceContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  customFields?: Record<string, string>;
}

export interface AudienceContact {
  id: string;
  email: string;
  name: string;
  listNames: string[];
  isExcluded: boolean;
  createdAt: string;
}

function buildListContactsQuery(
  query: EmailExcludedListContactsQuery = {},
): string {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.limit) {
    params.set('limit', String(query.limit));
  }

  if (query.includeManual === false) {
    params.set('includeManual', 'false');
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const emailExcludedService = {
  getAll() {
    return apiClient.get<EmailExcludedAddress[]>(ENDPOINTS.emailExcluded.list);
  },

  getListContacts(query?: EmailExcludedListContactsQuery) {
    return apiClient.get<EmailExcludedListContactsPage>(
      `${ENDPOINTS.emailExcluded.listContacts}${buildListContactsQuery(query)}`,
    );
  },

  createListContact(input: CreateAudienceContactInput) {
    return apiClient.post<AudienceContact>(
      ENDPOINTS.emailExcluded.createListContact,
      input,
    );
  },

  assignListContact(input: AssignAudienceContactToListInput) {
    return apiClient.post<EmailExcludedListContact>(
      ENDPOINTS.emailExcluded.assignListContact,
      input,
    );
  },

  add(email: string) {
    return apiClient.post<EmailExcludedAddress>(
      ENDPOINTS.emailExcluded.create,
      { email },
    );
  },

  excludeFromList(listId: string, listType: EmailExcludedListType) {
    return apiClient.post<ExcludeFromListResult>(
      ENDPOINTS.emailExcluded.fromList,
      { listId, listType },
    );
  },

  remove(id: string) {
    return apiClient.delete<void>(ENDPOINTS.emailExcluded.byId(id));
  },
};

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { CrmImportResult } from '@/lib/crm/import/types';

export type NotionImportDestination = 'company' | 'prospect' | 'contact-list';

export interface NotionConnectionStatus {
  connected: boolean;
}

export interface NotionDatabaseSummary {
  id: string;
  title: string;
}

export interface NotionColumnStatus {
  propertyId: string;
  propertyName: string;
  included: boolean;
  status: 'mapped' | 'create' | 'skipped' | 'unsupported';
  targetLabel?: string;
  targetKey?: string;
}

export interface NotionColumnsResponse {
  databaseId: string;
  databaseTitle: string;
  destination: NotionImportDestination;
  columns: NotionColumnStatus[];
  missingRequiredLabels: string[];
}

export interface NotionImportInput {
  databaseId: string;
  destination: NotionImportDestination;
  excludedPropertyIds: string[];
  contactListName?: string;
}

export const notionIntegrationsService = {
  getConnection() {
    return apiClient.get<NotionConnectionStatus>(ENDPOINTS.notion.connection);
  },

  connect(integrationToken: string) {
    return apiClient.put<NotionConnectionStatus>(ENDPOINTS.notion.connection, {
      integrationToken,
    });
  },

  disconnect() {
    return apiClient.delete<NotionConnectionStatus>(ENDPOINTS.notion.connection);
  },

  listDatabases() {
    return apiClient.get<NotionDatabaseSummary[]>(ENDPOINTS.notion.databases);
  },

  getColumns(databaseId: string, destination: NotionImportDestination) {
    return apiClient.get<NotionColumnsResponse>(
      ENDPOINTS.notion.columns(databaseId, destination),
    );
  },

  importRows(input: NotionImportInput) {
    return apiClient.post<CrmImportResult>(ENDPOINTS.notion.import, input);
  },
};

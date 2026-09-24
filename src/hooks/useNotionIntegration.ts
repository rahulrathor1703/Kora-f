'use client';

import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import {
  notionIntegrationsService,
  type NotionImportDestination,
  type NotionImportInput,
} from '@/lib/api/services/notion-integrations.service';

export function useNotionConnection() {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(`notion.connection.${orgScopeKey}`, () =>
    notionIntegrationsService.getConnection(),
  );
}

export function useNotionDatabases(enabled: boolean) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `notion.databases.${orgScopeKey}`,
    () => notionIntegrationsService.listDatabases(),
    { enabled },
  );
}

export function useNotionColumns(
  databaseId: string,
  destination: NotionImportDestination | '',
  enabled: boolean,
) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `notion.columns.${orgScopeKey}.${databaseId}.${destination}`,
    () =>
      notionIntegrationsService.getColumns(
        databaseId,
        destination as NotionImportDestination,
      ),
    { enabled: enabled && databaseId.length > 0 && destination.length > 0 },
  );
}

export function useConnectNotion() {
  return useApiMutation((integrationToken: string) =>
    notionIntegrationsService.connect(integrationToken),
  );
}

export function useDisconnectNotion() {
  return useApiMutation(() => notionIntegrationsService.disconnect());
}

export function useImportFromNotion() {
  return useApiMutation((input: NotionImportInput) =>
    notionIntegrationsService.importRows(input),
  );
}

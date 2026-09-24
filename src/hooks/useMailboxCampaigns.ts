'use client';

import { mailboxService } from '@/lib/api';
import { useApiQuery } from '@/hooks/api';

export function mailboxCampaignsQueryKey(id: string) {
  return `mailboxes.campaigns.${id}`;
}

export function useMailboxCampaigns(id: string | null) {
  return useApiQuery(
    mailboxCampaignsQueryKey(id ?? 'none'),
    () => mailboxService.getCampaigns(id!),
    { enabled: Boolean(id) },
  );
}

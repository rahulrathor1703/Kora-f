'use client';

import { mailboxService } from '@/lib/api';
import { useApiQuery } from '@/hooks/api';

export function mailboxDetailQueryKey(id: string) {
  return `mailboxes.detail.${id}`;
}

export function useMailbox(id: string | null) {
  return useApiQuery(
    mailboxDetailQueryKey(id ?? 'none'),
    () => mailboxService.getById(id!),
    { enabled: Boolean(id) },
  );
}

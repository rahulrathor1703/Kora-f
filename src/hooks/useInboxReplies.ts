'use client';

import { inboxService } from '@/lib/api';
import type { InboxRepliesQuery } from '@/lib/email/inbox/inbox-types';
import { useApiQuery } from '@/hooks/api';

export function useInboxReplies(query: InboxRepliesQuery) {
  const queryKey = [
    'email-inbox.replies',
    query.search ?? '',
    query.campaignId ?? '',
    query.replyCategory ?? '',
    query.page ?? 1,
    query.limit ?? 25,
  ].join('.');

  return useApiQuery(queryKey, () => inboxService.getReplies(query));
}

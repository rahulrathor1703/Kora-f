'use client';

import { useCallback } from 'react';
import { invalidateQueriesByPrefix, useApiMutation } from '@/hooks/api';
import { inboxService } from '@/lib/api';
import type { EmailCampaignReplyCategory } from '@/lib/email/campaigns/reply-category-utils';

interface MarkInboxReplyDoneInput {
  recipientId: string;
  replyCategory: EmailCampaignReplyCategory;
  reason?: string;
}

export function useMarkInboxReplyDone() {
  const { mutate, isLoading, error, reset } = useApiMutation(
    ({ recipientId, replyCategory, reason }: MarkInboxReplyDoneInput) =>
      inboxService.markReplyDone(recipientId, { replyCategory, reason }),
  );

  const markReplyDone = useCallback(
    async (input: MarkInboxReplyDoneInput) => {
      const result = await mutate(input);
      invalidateQueriesByPrefix('email-inbox.replies');
      return result;
    },
    [mutate],
  );

  return {
    markReplyDone,
    isMarkingDone: isLoading,
    error,
    reset,
  };
}

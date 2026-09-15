import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { EmailCampaignReplyCategory } from '@/lib/email/campaigns/reply-category-utils';
import type {
  InboxRepliesQuery,
  InboxReply,
  PaginatedInboxReplies,
} from '@/lib/email/inbox/inbox-types';

export interface MarkInboxReplyDonePayload {
  replyCategory: EmailCampaignReplyCategory;
  reason?: string;
}

export const inboxService = {
  getReplies(query: InboxRepliesQuery = {}) {
    const params = new URLSearchParams();

    if (query.search) {
      params.set('search', query.search);
    }

    if (query.campaignId) {
      params.set('campaignId', query.campaignId);
    }

    if (query.replyCategory) {
      params.set('replyCategory', query.replyCategory);
    }

    if (query.page) {
      params.set('page', String(query.page));
    }

    if (query.limit) {
      params.set('limit', String(query.limit));
    }

    const suffix = params.size > 0 ? `?${params.toString()}` : '';

    return apiClient.get<PaginatedInboxReplies>(
      `${ENDPOINTS.emailInbox.replies}${suffix}`,
    );
  },

  markReplyDone(recipientId: string, payload: MarkInboxReplyDonePayload) {
    return apiClient.post<InboxReply>(
      ENDPOINTS.emailInbox.markReplyDone(recipientId),
      payload,
    );
  },
};

import type { EmailCampaignReplyCategory } from '@/lib/email/campaigns/reply-category-utils';

export interface InboxReply {
  recipientId: string;
  campaignId: string;
  campaignName: string;
  recipientEmail: string;
  recipientName: string | null;
  replySubject: string | null;
  repliedAt: string | null;
  replyCategory: EmailCampaignReplyCategory | null;
  replyReadAt: string | null;
  replyDoneReason: string | null;
  currentStepOrder: number;
  contactDisposition: string;
}

export interface PaginatedInboxReplies {
  items: InboxReply[];
  total: number;
  page: number;
  limit: number;
}

export interface InboxRepliesQuery {
  search?: string;
  campaignId?: string;
  replyCategory?: EmailCampaignReplyCategory;
  page?: number;
  limit?: number;
}

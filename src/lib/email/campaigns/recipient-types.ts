export type CampaignRecipientEngagementStatus =
  | 'pending'
  | 'sent'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'replied';

export interface CampaignRecipientMessage {
  stepOrder: number;
  deliveryStatus: string;
  sentAt: string | null;
  openedAt: string | null;
  openCount: number;
  clickedAt: string | null;
  clickCount: number;
  bouncedAt: string | null;
  bounceReason: string | null;
}

export interface CampaignRecipientEngagement {
  status: CampaignRecipientEngagementStatus;
  latestDeliveryStatus: 'pending' | 'sent' | 'bounced' | 'failed';
  opened: boolean;
  openedAt: string | null;
  openCount: number;
  clicked: boolean;
  clickedAt: string | null;
  clickCount: number;
  bounced: boolean;
  bouncedAt: string | null;
  bounceReason: string | null;
}

export interface CampaignRecipientDetail {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  currentStepOrder: number;
  lastSentAt: string | null;
  replyCategory:
    | 'interested'
    | 'not_now'
    | 'no'
    | 'ooo'
    | 'wrong_person'
    | null;
  repliedAt: string | null;
  contactDisposition:
    | 'eligible'
    | 'excluded'
    | 'paused'
    | 'stopped'
    | 'unsubscribed'
    | 'done';
  pausedUntil: string | null;
  allowSendDespiteReply: boolean;
  globallyExcluded: boolean;
  engagement: CampaignRecipientEngagement;
  messages: CampaignRecipientMessage[];
}

export interface PaginatedCampaignRecipients {
  items: CampaignRecipientDetail[];
  total: number;
  page: number;
  limit: number;
}

export type CampaignRecipientDisposition =
  | 'eligible'
  | 'excluded'
  | 'paused'
  | 'stopped'
  | 'unsubscribed'
  | 'done';

export interface CampaignRecipientsQuery {
  search?: string;
  status?: CampaignRecipientEngagementStatus;
  disposition?: CampaignRecipientDisposition;
  page?: number;
  limit?: number;
}

export interface AddCampaignRecipientInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export const CAMPAIGN_RECIPIENT_STATUS_OPTIONS: Array<{
  value: CampaignRecipientEngagementStatus;
  label: string;
}> = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'replied', label: 'Replied' },
];

export interface EmailCampaignProgressRecipientStatus {
  status: CampaignRecipientEngagementStatus;
  label: string;
  count: number;
  percent: number;
}

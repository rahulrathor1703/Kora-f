export type EmailCampaignEventType =
  | 'sent'
  | 'open'
  | 'click'
  | 'bounce'
  | 'send_failed'
  | 'reply'
  | 'unsubscribe';

export interface CampaignEventMetadata {
  url?: string;
  linkIndex?: number;
  linkLabel?: string;
  userAgent?: string;
  ipAddress?: string;
  reason?: string;
  source?: 'imap' | 'smtp' | 'inferred_from_reply';
  stepOrder?: number;
  providerMessageId?: string | null;
  isUnique?: boolean;
  correlationMethod?:
    | 'pixel'
    | 'click_redirect'
    | 'imap_token'
    | 'imap_message_id'
    | 'imap_fallback';
}

export interface CampaignEvent {
  id: string;
  eventType: EmailCampaignEventType;
  occurredAt: string;
  recipientId: string;
  recipientEmail: string;
  messageId: string | null;
  stepOrder: number | null;
  metadata: CampaignEventMetadata;
}

export interface PaginatedCampaignEvents {
  items: CampaignEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface CampaignEventsQuery {
  search?: string;
  eventType?: EmailCampaignEventType;
  recipientId?: string;
  stepOrder?: number;
  page?: number;
  limit?: number;
}

export const CAMPAIGN_EVENT_TYPE_OPTIONS: Array<{
  value: EmailCampaignEventType | '';
  label: string;
}> = [
  { value: '', label: 'All events' },
  { value: 'sent', label: 'Sent' },
  { value: 'open', label: 'Opened' },
  { value: 'click', label: 'Clicked' },
  { value: 'bounce', label: 'Bounced' },
  { value: 'send_failed', label: 'Send failed' },
  { value: 'reply', label: 'Replied' },
  { value: 'unsubscribe', label: 'Unsubscribed' },
];

export const CAMPAIGN_EVENT_TYPE_LABELS: Record<EmailCampaignEventType, string> =
  {
    sent: 'Sent',
    open: 'Opened',
    click: 'Clicked',
    bounce: 'Bounced',
    send_failed: 'Send failed',
    reply: 'Replied',
    unsubscribe: 'Unsubscribed',
  };

export const CAMPAIGN_EVENT_CHIP_COLORS: Record<
  EmailCampaignEventType,
  'default' | 'info' | 'warning' | 'primary' | 'error' | 'success'
> = {
  sent: 'info',
  open: 'warning',
  click: 'primary',
  bounce: 'error',
  send_failed: 'error',
  reply: 'success',
  unsubscribe: 'default',
};

import type { CampaignRecipientEngagementStatus } from '@/lib/email/campaigns/recipient-types';

export const CAMPAIGN_RECIPIENT_STATUS_LABELS: Record<
  CampaignRecipientEngagementStatus,
  string
> = {
  pending: 'Pending',
  sent: 'Sent',
  opened: 'Opened',
  clicked: 'Clicked',
  bounced: 'Bounced',
  replied: 'Replied',
};

import type { ChipProps } from '@mui/material/Chip';

export const CAMPAIGN_RECIPIENT_STATUS_COLORS: Record<
  CampaignRecipientEngagementStatus,
  NonNullable<ChipProps['color']>
> = {
  pending: 'default',
  sent: 'info',
  opened: 'warning',
  clicked: 'primary',
  bounced: 'error',
  replied: 'success',
};

export function formatTrackingTimestamp(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

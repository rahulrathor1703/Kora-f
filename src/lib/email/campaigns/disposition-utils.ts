import type { CampaignRecipientDisposition } from '@/lib/email/campaigns/recipient-types';

export const CAMPAIGN_RECIPIENT_DISPOSITION_LABELS: Record<
  CampaignRecipientDisposition,
  string
> = {
  eligible: 'Active',
  excluded: 'Excluded',
  paused: 'Paused',
  stopped: 'Stopped',
  unsubscribed: 'Unsubscribed',
  done: 'Done',
};

export const CAMPAIGN_RECIPIENT_DISPOSITION_COLORS: Record<
  CampaignRecipientDisposition,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  eligible: 'success',
  excluded: 'warning',
  paused: 'info',
  stopped: 'error',
  unsubscribed: 'error',
  done: 'default',
};

export const CAMPAIGN_RECIPIENT_DISPOSITION_TOOLTIPS: Record<
  CampaignRecipientDisposition,
  string
> = {
  eligible: 'Receiving campaign emails',
  excluded: 'Manually excluded from this campaign',
  paused: 'Paused from campaign outreach',
  stopped: 'Stopped for this campaign or due to bounce or global suppression',
  unsubscribed: 'Opted out of emails',
  done: 'Completed the email sequence',
};

function isGloballyExcludedFlag(value: unknown): boolean {
  return value === true;
}

export function canPauseRecipient(
  disposition: CampaignRecipientDisposition,
): boolean {
  return disposition === 'eligible';
}

export function canStopRecipient(
  disposition: CampaignRecipientDisposition,
): boolean {
  return disposition === 'eligible' || disposition === 'paused';
}

export function canExcludeRecipientGlobally(
  disposition: CampaignRecipientDisposition,
  globallyExcluded = false,
): boolean {
  return (
    !isGloballyExcludedFlag(globallyExcluded) &&
    (disposition === 'eligible' ||
      disposition === 'paused' ||
      disposition === 'stopped')
  );
}

export function canResumeRecipient(
  disposition: CampaignRecipientDisposition,
  pausedUntil?: string | null,
  repliedAt?: string | null,
): boolean {
  return (
    disposition === 'paused' &&
    (Boolean(pausedUntil) || Boolean(repliedAt))
  );
}

export function canPerformRecipientActions(
  disposition: CampaignRecipientDisposition,
  globallyExcluded = false,
  pausedUntil?: string | null,
  repliedAt?: string | null,
): boolean {
  return (
    canPauseRecipient(disposition) ||
    canStopRecipient(disposition) ||
    canExcludeRecipientGlobally(disposition, globallyExcluded) ||
    canResumeRecipient(disposition, pausedUntil, repliedAt)
  );
}

export function formatDispositionLabel(
  disposition: CampaignRecipientDisposition,
  pausedUntil?: string | null,
  repliedAt?: string | null,
): string {
  if (disposition === 'paused' && pausedUntil) {
    return `Paused until ${new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(pausedUntil))}`;
  }

  if (disposition === 'paused' && repliedAt) {
    return 'Paused (replied)';
  }

  return CAMPAIGN_RECIPIENT_DISPOSITION_LABELS[disposition] ?? disposition;
}

export function getDispositionTooltip(
  disposition: CampaignRecipientDisposition,
  pausedUntil?: string | null,
  repliedAt?: string | null,
): string {
  if (disposition === 'paused' && pausedUntil) {
    return `Manually paused until ${new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(pausedUntil))}. Use Resume to continue early.`;
  }

  if (disposition === 'paused' && repliedAt) {
    return 'Automatically paused because this contact replied to a campaign email. Use Continue to resume the sequence, or Stop/Exclude to end outreach.';
  }

  if (disposition === 'paused') {
    return 'Paused from campaign outreach';
  }

  return CAMPAIGN_RECIPIENT_DISPOSITION_TOOLTIPS[disposition];
}

export function canExcludeRecipient(
  disposition: CampaignRecipientDisposition,
): boolean {
  return disposition === 'eligible';
}

export function canIncludeRecipient(
  disposition: CampaignRecipientDisposition,
): boolean {
  return disposition === 'excluded';
}

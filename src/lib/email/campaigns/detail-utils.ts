import type {
  EmailCampaign,
  EmailCampaignMailboxSender,
  EmailCampaignSequenceStep,
  EmailCampaignStatus,
} from '@/lib/email/campaigns/types';

export const STATUS_LABELS: Record<EmailCampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
  paused: 'Paused',
  stopped: 'Stopped',
};

export const STATUS_COLORS: Record<
  EmailCampaignStatus,
  'default' | 'success' | 'warning' | 'info' | 'error'
> = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  failed: 'error',
  paused: 'warning',
  stopped: 'error',
};

export function formatStatusLabel(status: EmailCampaignStatus): string {
  return STATUS_LABELS[status];
}

export function formatDetailDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFollowUpGaps(steps: EmailCampaignSequenceStep[]): string {
  const followUps = steps
    .filter((step) => step.stepOrder > 1)
    .sort((a, b) => a.stepOrder - b.stepOrder);

  if (followUps.length === 0) {
    return '—';
  }

  return followUps.map((step) => `${step.delayDays}d`).join(' → ');
}

export function formatCampaignMeta(
  typeLabel: string,
  regionLabel: string,
  senders: EmailCampaignMailboxSender[],
): string {
  const parts = [typeLabel, regionLabel].filter((part) => part && part !== '—');

  if (senders.length > 0) {
    const primary = senders[0];
    parts.push(`${primary.senderName} <${primary.senderEmail}>`);
  }

  return parts.length > 0 ? parts.join(' · ') : '—';
}

export function deriveSentCount(campaign: EmailCampaign): number {
  if (campaign.status === 'sent') {
    return campaign.audienceCount;
  }

  return 0;
}

export function truncateId(id: string, visibleChars = 8): string {
  if (id.length <= visibleChars * 2 + 3) {
    return id;
  }

  return `${id.slice(0, visibleChars)}…${id.slice(-visibleChars)}`;
}

export function getMaxFollowUps(steps: EmailCampaignSequenceStep[]): number {
  return Math.max(0, steps.filter((step) => step.stepOrder > 1).length);
}

export const PROGRESS_STEPS: EmailCampaignStatus[] = [
  'draft',
  'scheduled',
  'sending',
  'sent',
];

export function getProgressStepIndex(status: EmailCampaignStatus): number {
  if (status === 'failed' || status === 'stopped') {
    return -1;
  }

  const index = PROGRESS_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

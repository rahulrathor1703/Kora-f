import type { EmailCampaignMailboxSenderStatus } from '@/lib/email/campaigns/types';

export function canPauseMailboxSender(
  status: EmailCampaignMailboxSenderStatus,
): boolean {
  return status === 'active';
}

export function canResumeMailboxSender(
  status: EmailCampaignMailboxSenderStatus,
): boolean {
  return status === 'paused';
}

export function canStopMailboxSender(
  status: EmailCampaignMailboxSenderStatus,
): boolean {
  return status === 'active' || status === 'paused';
}

export function canEditMailboxSender(
  status: EmailCampaignMailboxSenderStatus,
): boolean {
  return status === 'active' || status === 'paused';
}

export function isLastActiveMailboxSender(
  status: EmailCampaignMailboxSenderStatus,
  activeSenderCount: number,
): boolean {
  return status === 'active' && activeSenderCount === 1;
}

export function countActiveMailboxSenders(
  senders: Array<{ status: EmailCampaignMailboxSenderStatus }>,
): number {
  return senders.filter((sender) => sender.status === 'active').length;
}

export function getPausedMailboxSenders<
  TSender extends {
    status: EmailCampaignMailboxSenderStatus;
    senderEmail?: string;
  },
>(senders: TSender[]): TSender[] {
  return senders.filter((sender) => sender.status === 'paused');
}

export function requiresMailboxResumeForCampaignResume(
  senders: Array<{ status: EmailCampaignMailboxSenderStatus }>,
): boolean {
  return (
    senders.length > 0 &&
    countActiveMailboxSenders(senders) === 0 &&
    senders.some((sender) => sender.status === 'paused')
  );
}

export function requiresAddMailboxForCampaignResume(
  senders: Array<{ status: EmailCampaignMailboxSenderStatus }>,
): boolean {
  return (
    senders.length > 0 &&
    countActiveMailboxSenders(senders) === 0 &&
    !senders.some((sender) => sender.status === 'paused')
  );
}

export const CAMPAIGN_RESUME_REQUIRES_MAILBOX_MESSAGE =
  'Cannot resume campaign without an active mailbox sender. Add a mailbox to this campaign before resuming.';

export function getMailboxSenderStatusLabel(
  status: EmailCampaignMailboxSenderStatus,
): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'stopped':
      return 'Stopped';
  }
}

export const LIVE_CAMPAIGN_MAILBOX_STATUSES = [
  'scheduled',
  'sending',
  'paused',
] as const;

export function canManageCampaignMailboxes(
  status: string,
): status is (typeof LIVE_CAMPAIGN_MAILBOX_STATUSES)[number] {
  return LIVE_CAMPAIGN_MAILBOX_STATUSES.includes(
    status as (typeof LIVE_CAMPAIGN_MAILBOX_STATUSES)[number],
  );
}

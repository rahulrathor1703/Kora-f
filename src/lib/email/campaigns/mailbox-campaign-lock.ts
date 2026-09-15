import type { EmailCampaign } from '@/lib/email/campaigns/types';

export const MAILBOX_LOCKING_CAMPAIGN_STATUSES = ['scheduled', 'sending'] as const;

export type MailboxLockingCampaignStatus =
  (typeof MAILBOX_LOCKING_CAMPAIGN_STATUSES)[number];

export interface MailboxLockInfo {
  campaignId: string;
  campaignName: string;
}

export function buildMailboxLockMap(
  campaigns: EmailCampaign[],
  excludeCampaignId?: string,
): Map<string, MailboxLockInfo> {
  const lockMap = new Map<string, MailboxLockInfo>();

  for (const campaign of campaigns) {
    if (
      excludeCampaignId &&
      campaign.id === excludeCampaignId
    ) {
      continue;
    }

    if (
      !MAILBOX_LOCKING_CAMPAIGN_STATUSES.includes(
        campaign.status as MailboxLockingCampaignStatus,
      )
    ) {
      continue;
    }

    for (const sender of campaign.mailboxSenders) {
      if (sender.status !== undefined && sender.status !== 'active') {
        continue;
      }

      if (!lockMap.has(sender.mailboxId)) {
        lockMap.set(sender.mailboxId, {
          campaignId: campaign.id,
          campaignName: campaign.name,
        });
      }
    }
  }

  return lockMap;
}

export function getMailboxLockReason(
  mailboxId: string,
  lockMap: Map<string, MailboxLockInfo>,
  mailboxLabel?: string,
): string | null {
  const lock = lockMap.get(mailboxId);

  if (!lock) {
    return null;
  }

  const label = mailboxLabel ?? 'This mailbox';

  return `"${label}" is already sending from "${lock.campaignName}". Pause, stop, or complete that campaign before using this mailbox.`;
}

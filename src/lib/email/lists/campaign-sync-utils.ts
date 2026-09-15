import type { LinkedCampaignSummary } from '@/lib/email/lists/detail-types';

const PUSH_PROMPT_CAMPAIGN_STATUSES = new Set([
  'draft',
  'scheduled',
  'sending',
  'paused',
]);

export function hasPushEligibleCampaigns(
  campaigns: LinkedCampaignSummary[],
): boolean {
  return campaigns.some((campaign) =>
    PUSH_PROMPT_CAMPAIGN_STATUSES.has(campaign.status),
  );
}

export function formatPushMemberCountLabel(count: number): string {
  return count === 1 ? '1 contact' : `${count} contacts`;
}

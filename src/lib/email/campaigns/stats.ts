import type { EmailCampaign } from '@/lib/email/campaigns/types';

export interface EmailCampaignStats {
  total: number;
}

export function getCampaignSubject(campaign: EmailCampaign): string {
  const initialStep = campaign.steps.find((step) => step.stepOrder === 1);
  return initialStep?.subject ?? '—';
}

export function computeEmailCampaignStats(
  campaigns: EmailCampaign[],
): EmailCampaignStats {
  return {
    total: campaigns.length,
  };
}

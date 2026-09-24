import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

export function canPauseCampaign(status: EmailCampaignStatus): boolean {
  return status === 'scheduled' || status === 'sending';
}

export function canStopCampaign(status: EmailCampaignStatus): boolean {
  return status === 'scheduled' || status === 'sending' || status === 'paused';
}

export function canResumeCampaign(status: EmailCampaignStatus): boolean {
  return status === 'paused';
}

export function hasVisibleCampaignActions(status: EmailCampaignStatus): boolean {
  return canPauseCampaign(status) || canStopCampaign(status) || canResumeCampaign(status);
}

import type { CampaignRecipientDetail } from '@/lib/email/campaigns/recipient-types';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

export interface ProspectCampaignItem {
  campaignId: string;
  campaignName: string;
  campaignStatus: EmailCampaignStatus;
  audienceListType: 'contact' | 'manual' | null;
  audienceListId: string | null;
  recipient: CampaignRecipientDetail;
}

export interface ProspectCampaignList {
  items: ProspectCampaignItem[];
  total: number;
}

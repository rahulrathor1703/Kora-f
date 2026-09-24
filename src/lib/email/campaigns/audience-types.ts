export type CampaignAudienceDispositionFilter = 'all' | 'eligible' | 'excluded';

export type CampaignRecipientDisposition =
  | 'eligible'
  | 'excluded'
  | 'paused'
  | 'stopped'
  | 'unsubscribed'
  | 'done';

export interface CampaignAudienceRecipient {
  id: string;
  email: string;
  campaignId: string;
  campaignName: string;
  audienceListType: 'contact' | 'manual';
  audienceListId: string;
  currentStepOrder: number;
  contactDisposition: CampaignRecipientDisposition;
  lastSentAt: string | null;
  mergeFields: Record<string, string>;
}

export interface PaginatedCampaignAudience {
  items: CampaignAudienceRecipient[];
  total: number;
  page: number;
  limit: number;
}

export interface CampaignAudienceQuery {
  campaignId?: string;
  disposition?: CampaignAudienceDispositionFilter;
  search?: string;
  page?: number;
  limit?: number;
}

export const CAMPAIGN_RECIPIENT_DISPOSITION_OPTIONS: Array<{
  value: CampaignRecipientDisposition;
  label: string;
}> = [
  { value: 'eligible', label: 'Active' },
  { value: 'excluded', label: 'Excluded' },
  { value: 'paused', label: 'Paused' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'done', label: 'Done' },
];

export const CAMPAIGN_AUDIENCE_VIEW_OPTIONS: Array<{
  value: CampaignAudienceDispositionFilter;
  label: string;
}> = [
  { value: 'all', label: 'All contacts' },
  { value: 'excluded', label: 'Excluded only' },
];

import type { EmailCampaign } from './types';

export interface EmailCampaignListMetrics {
  totalSent: number;
  deliverability: number;
  openRate: number;
  ctr: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  sendingPace: number | null;
}

export interface EmailCampaignListMetricsRecord extends EmailCampaignListMetrics {
  campaignId: string;
}

export type EmailCampaignListRow = EmailCampaign & EmailCampaignListMetrics;

export const EMPTY_CAMPAIGN_LIST_METRICS: EmailCampaignListMetrics = {
  totalSent: 0,
  deliverability: 0,
  openRate: 0,
  ctr: 0,
  replyRate: 0,
  bounceRate: 0,
  unsubscribeRate: 0,
  sendingPace: null,
};

export const CAMPAIGN_LIST_METRIC_FIELDS = [
  'totalSent',
  'deliverability',
  'openRate',
  'ctr',
  'replyRate',
  'bounceRate',
  'unsubscribeRate',
  'sendingPace',
] as const satisfies readonly (keyof EmailCampaignListMetrics)[];

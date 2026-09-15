import {
  getActiveFieldFilters,
  type FieldFilter,
} from '@/components/data-table/filterTableRows';
import { STATUS_LABELS } from '@/lib/email/campaigns/detail-utils';
import { getCampaignSubject } from '@/lib/email/campaigns/stats';
import type { EmailCampaign, EmailCampaignStatus } from '@/lib/email/campaigns/types';

export const CAMPAIGN_PIPELINE_STATUSES: EmailCampaignStatus[] = [
  'draft',
  'scheduled',
  'sending',
  'paused',
  'stopped',
  'sent',
  'failed',
];

export const CAMPAIGN_PIPELINE_COLORS: Record<EmailCampaignStatus, string> = {
  draft: '#64748b',
  scheduled: '#3b82f6',
  sending: '#f59e0b',
  paused: '#a855f7',
  stopped: '#dc2626',
  sent: '#22c55e',
  failed: '#ef4444',
};

export const CAMPAIGN_VIEW_MODE_STORAGE_KEY = 'email-campaigns.viewMode';

export function getCampaignColumnId(status: EmailCampaignStatus): string {
  return `campaign-column-${status}`;
}

export function parseCampaignColumnId(
  columnId: string,
): EmailCampaignStatus | null {
  if (!columnId.startsWith('campaign-column-')) {
    return null;
  }

  const status = columnId.slice('campaign-column-'.length) as EmailCampaignStatus;
  return CAMPAIGN_PIPELINE_STATUSES.includes(status) ? status : null;
}

export function groupCampaignsByStatus(
  campaigns: EmailCampaign[],
): Record<EmailCampaignStatus, EmailCampaign[]> {
  const grouped = Object.fromEntries(
    CAMPAIGN_PIPELINE_STATUSES.map((status) => [status, [] as EmailCampaign[]]),
  ) as Record<EmailCampaignStatus, EmailCampaign[]>;

  for (const campaign of campaigns) {
    const bucket = grouped[campaign.status];
    if (bucket) {
      bucket.push(campaign);
    }
  }

  return grouped;
}

export function getCampaignPipelineStageLabel(status: EmailCampaignStatus): string {
  return STATUS_LABELS[status];
}

export function buildCampaignPipelineBoardKey(
  search: string,
  fieldFilters: FieldFilter[] = [],
): string {
  return `${search}-${JSON.stringify(getActiveFieldFilters(fieldFilters))}`;
}

export function filterCampaignsBySearch(
  campaigns: EmailCampaign[],
  search: string,
): EmailCampaign[] {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return campaigns;
  }

  return campaigns.filter((campaign) => {
    const subject = getCampaignSubject(campaign).toLowerCase();
    return (
      campaign.name.toLowerCase().includes(normalizedSearch) ||
      subject.includes(normalizedSearch)
    );
  });
}

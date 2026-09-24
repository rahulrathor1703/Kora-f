import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { ColumnOverride } from '@/components/data-table/types';
import { formatDetailDate, formatStatusLabel } from '@/lib/email/campaigns/detail-utils';
import { getCampaignSubject } from '@/lib/email/campaigns/stats';
import { formatMetricValue } from '@/lib/email/analytics/types';
import type { EmailCampaignListRow } from '@/lib/email/campaigns/list-metrics-types';
import type { EmailCampaign } from '@/lib/email/campaigns/types';

export const CAMPAIGN_LIST_TABLE_ID = 'email-campaigns';
export const CAMPAIGN_PIPELINE_CARD_TABLE_ID = 'email-campaigns-pipeline-cards';

export const CAMPAIGN_LIST_EXCLUDE_FIELDS = [
  'id',
  'goal',
  'campaignTypeId',
  'regionId',
  'audienceListType',
  'steps',
  'mailboxSenders',
  'updatedAt',
  'pausedUntil',
  'statusBeforePause',
] as const;

export const CAMPAIGN_LIST_INCLUDE_FIELDS = [
  'publicCampaignId',
  'brandId',
  'campaignTypeId',
  'regionId',
] as const;

export const CAMPAIGN_LIST_METRIC_INCLUDE_FIELDS = [
  'totalSent',
  'deliverability',
  'openRate',
  'ctr',
  'replyRate',
  'bounceRate',
  'unsubscribeRate',
  'sendingPace',
] as const;

export const CAMPAIGN_LIST_TABLE_INCLUDE_FIELDS = [
  ...CAMPAIGN_LIST_INCLUDE_FIELDS,
  ...CAMPAIGN_LIST_METRIC_INCLUDE_FIELDS,
] as const;

export const CAMPAIGN_PIPELINE_CARD_EXCLUDE_FIELDS = [
  'id',
  'goal',
  'audienceListType',
  'mailboxSenders',
  'updatedAt',
  'pausedUntil',
  'statusBeforePause',
  'name',
  'status',
  'customFieldValues',
] as const;

export const CAMPAIGN_PIPELINE_CARD_INCLUDE_FIELDS = [
  'steps',
  'audienceCount',
  'launchAt',
  'brandId',
  'campaignTypeId',
  'regionId',
  'audienceListId',
  'createdAt',
  'goal',
  'scheduledAt',
  'estimatedEndAt',
  'dailyBatchSize',
  'timezone',
  'wizardStepIndex',
] as const;

interface LabelMaps {
  brandLabelById: Map<string, string>;
  typeLabelById: Map<string, string>;
  regionLabelById: Map<string, string>;
  listNameById: Map<string, string>;
}

interface CampaignColumnOverrideContext extends LabelMaps {
  formatDate: (value: string | null) => string;
  formatStepCount: (campaign: EmailCampaign) => string;
  renderStatus: (row: EmailCampaign) => ReactNode;
}

function resolveLabel(
  map: Map<string, string>,
  id: string | null,
  fallback: string,
): string {
  if (!id) {
    return '—';
  }

  return map.get(id) ?? fallback;
}

function formatAudienceCount(count: number): string {
  return `${count.toLocaleString()} contact${count === 1 ? '' : 's'}`;
}

function formatSendingPace(value: number | null): string {
  if (value == null || value <= 0) {
    return '—';
  }

  return `${value}/day`;
}

export function buildCampaignMetricColumnOverrides(): Partial<
  Record<string, ColumnOverride<EmailCampaignListRow>>
> {
  return {
    totalSent: {
      label: 'Total sent',
      defaultVisible: false,
      render: (row) =>
        row.totalSent > 0 ? row.totalSent.toLocaleString() : '0',
      filterValue: (row) =>
        row.totalSent > 0 ? row.totalSent.toLocaleString() : '0',
    },
    deliverability: {
      label: 'Deliverability',
      defaultVisible: false,
      render: (row) => formatMetricValue(row.deliverability, 'percent'),
      filterValue: (row) => formatMetricValue(row.deliverability, 'percent'),
    },
    openRate: {
      label: 'Open rate',
      defaultVisible: false,
      render: (row) => formatMetricValue(row.openRate, 'percent'),
      filterValue: (row) => formatMetricValue(row.openRate, 'percent'),
    },
    ctr: {
      label: 'CTR',
      defaultVisible: false,
      render: (row) => formatMetricValue(row.ctr, 'percent'),
      filterValue: (row) => formatMetricValue(row.ctr, 'percent'),
    },
    replyRate: {
      label: 'Reply rate',
      defaultVisible: false,
      render: (row) => formatMetricValue(row.replyRate, 'percent'),
      filterValue: (row) => formatMetricValue(row.replyRate, 'percent'),
    },
    bounceRate: {
      label: 'Bounce rate',
      defaultVisible: false,
      render: (row) => formatMetricValue(row.bounceRate, 'percent'),
      filterValue: (row) => formatMetricValue(row.bounceRate, 'percent'),
    },
    unsubscribeRate: {
      label: 'Unsubscribe rate',
      defaultVisible: false,
      render: (row) => formatMetricValue(row.unsubscribeRate, 'percent'),
      filterValue: (row) =>
        formatMetricValue(row.unsubscribeRate, 'percent'),
    },
    sendingPace: {
      label: 'Sending pace',
      defaultVisible: false,
      render: (row) => formatSendingPace(row.sendingPace),
      filterValue: (row) => formatSendingPace(row.sendingPace),
    },
  };
}

export function buildCampaignColumnOverrides(
  context: CampaignColumnOverrideContext,
): Partial<Record<string, ColumnOverride<EmailCampaign>>> {
  const {
    brandLabelById,
    typeLabelById,
    regionLabelById,
    listNameById,
    formatDate,
    formatStepCount,
    renderStatus,
  } = context;

  return {
    name: { label: 'Campaign' },
    publicCampaignId: {
      label: 'Campaign ID',
      defaultVisible: true,
      render: (row) => row.publicCampaignId ?? '—',
      filterValue: (row) => row.publicCampaignId ?? '',
    },
    brandId: {
      label: 'Product',
      render: (row) =>
        resolveLabel(brandLabelById, row.brandId, 'Unknown product'),
      filterValue: (row) =>
        resolveLabel(brandLabelById, row.brandId, 'Unknown product'),
    },
    campaignTypeId: {
      label: 'Campaign type',
      defaultVisible: false,
      render: (row) =>
        resolveLabel(typeLabelById, row.campaignTypeId, 'Unknown type'),
      filterValue: (row) =>
        resolveLabel(typeLabelById, row.campaignTypeId, 'Unknown type'),
    },
    regionId: {
      label: 'Region',
      defaultVisible: false,
      render: (row) =>
        resolveLabel(regionLabelById, row.regionId, 'Unknown region'),
      filterValue: (row) =>
        resolveLabel(regionLabelById, row.regionId, 'Unknown region'),
    },
    status: {
      label: 'Status',
      defaultVisible: false,
      render: renderStatus,
      filterValue: (row) => formatStatusLabel(row.status),
    },
    steps: {
      label: 'Sequence',
      defaultVisible: true,
      render: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">
            {formatStepCount(row)} emails
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getCampaignSubject(row)}
          </Typography>
        </Stack>
      ),
      filterValue: (row) =>
        `${formatStepCount(row)} emails ${getCampaignSubject(row)}`,
    },
    audienceCount: {
      label: 'Audience',
      defaultVisible: true,
      render: (row) =>
        row.audienceCount > 0 ? formatAudienceCount(row.audienceCount) : '—',
      filterValue: (row) =>
        row.audienceCount > 0 ? formatAudienceCount(row.audienceCount) : '—',
    },
    launchAt: {
      label: 'Launch',
      defaultVisible: true,
      render: (row) => formatDate(row.launchAt),
      filterValue: (row) => formatDate(row.launchAt),
    },
    createdAt: {
      label: 'Created',
      defaultVisible: false,
      render: (row) => formatDate(row.createdAt),
      filterValue: (row) => formatDate(row.createdAt),
    },
    audienceListId: {
      label: 'Audience list',
      defaultVisible: false,
      render: (row) =>
        resolveLabel(listNameById, row.audienceListId, 'Unknown list'),
      filterValue: (row) =>
        resolveLabel(listNameById, row.audienceListId, 'Unknown list'),
    },
    goal: {
      label: 'Goal',
      defaultVisible: false,
    },
    scheduledAt: {
      label: 'Scheduled',
      defaultVisible: false,
      render: (row) => formatDate(row.scheduledAt),
      filterValue: (row) => formatDate(row.scheduledAt),
    },
    estimatedEndAt: {
      label: 'Estimated end',
      defaultVisible: false,
      render: (row) => formatDate(row.estimatedEndAt),
      filterValue: (row) => formatDate(row.estimatedEndAt),
    },
  };
}

export function buildCampaignTableColumnOverrides(
  context: CampaignColumnOverrideContext,
): Partial<Record<string, ColumnOverride<EmailCampaignListRow>>> {
  return {
    ...buildCampaignColumnOverrides(context),
    ...buildCampaignMetricColumnOverrides(),
  };
}

export function buildCampaignPipelineCardColumnOverrides(
  context: CampaignColumnOverrideContext,
): Partial<Record<string, ColumnOverride<EmailCampaign>>> {
  const base = buildCampaignColumnOverrides(context);

  return {
    ...base,
    launchAt: {
      label: 'Launch',
      defaultVisible: true,
      render: (row) => {
        const dateValue = row.launchAt ?? row.createdAt;
        const caption = row.launchAt ? 'Launch' : 'Created';

        if (!dateValue) {
          return '—';
        }

        return `${caption}: ${formatDetailDate(dateValue)}`;
      },
    },
    createdAt: {
      label: 'Created',
      defaultVisible: false,
      render: (row) =>
        row.createdAt ? `Created: ${formatDetailDate(row.createdAt)}` : '—',
    },
  };
}
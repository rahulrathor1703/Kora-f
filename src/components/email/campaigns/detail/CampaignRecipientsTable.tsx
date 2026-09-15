'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import DataTable from '@/components/data-table/DataTable';
import CampaignRecipientActions from '@/components/email/campaigns/CampaignRecipientActions';
import { useCampaignRecipientActions } from '@/hooks/useCampaignRecipientActions';
import { mapCampaignRecipientFromApi } from '@/lib/email/campaigns/recipient-mapper';
import type { CampaignRecipientDetail } from '@/lib/email/campaigns/recipient-types';
import type { CampaignRecipientEngagementStatus } from '@/lib/email/campaigns/recipient-types';
import type { CampaignRecipientDisposition } from '@/lib/email/campaigns/recipient-types';
import {
  CAMPAIGN_RECIPIENT_DISPOSITION_COLORS,
  formatDispositionLabel,
  getDispositionTooltip,
} from '@/lib/email/campaigns/disposition-utils';
import {
  formatReplyCategoryLabel,
} from '@/lib/email/campaigns/reply-category-utils';
import {
  CAMPAIGN_RECIPIENT_STATUS_COLORS,
  CAMPAIGN_RECIPIENT_STATUS_LABELS,
  formatTrackingTimestamp,
} from '@/lib/email/campaigns/recipient-status-utils';

interface CampaignRecipientRow extends Record<string, unknown> {
  id: string;
  email: string;
  step: number;
  status: string;
  disposition: CampaignRecipientDisposition;
  pausedUntil: string | null;
  repliedAt: string | null;
  globallyExcluded: boolean;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  replyCategory: string | null;
  actions: string;
  recipient: CampaignRecipientDetail;
}

interface CampaignRecipientsTableProps {
  recipients: CampaignRecipientDetail[];
  isLoading: boolean;
  onRowClick: (recipient: CampaignRecipientDetail) => void;
  campaignId: string;
  onActionSuccess?: () => void | Promise<void>;
}

function toRow(recipient: CampaignRecipientDetail): CampaignRecipientRow {
  const normalized = mapCampaignRecipientFromApi(recipient);

  return {
    id: normalized.id,
    email: normalized.email,
    step: normalized.currentStepOrder,
    status: normalized.engagement.status,
    disposition: normalized.contactDisposition,
    pausedUntil: normalized.pausedUntil,
    repliedAt: normalized.repliedAt,
    globallyExcluded: normalized.globallyExcluded,
    sentAt: normalized.lastSentAt,
    openedAt: normalized.engagement.openedAt,
    clickedAt: normalized.engagement.clickedAt,
    bouncedAt: normalized.engagement.bouncedAt,
    replyCategory: normalized.replyCategory,
    actions: normalized.id,
    recipient: normalized,
  };
}

export default function CampaignRecipientsTable({
  recipients,
  isLoading,
  onRowClick,
  campaignId,
  onActionSuccess,
}: CampaignRecipientsTableProps) {
  const rows = recipients.map(toRow);
  const {
    pauseRecipient,
    stopRecipient,
    resumeRecipient,
    excludeRecipient,
    isUpdating,
  } = useCampaignRecipientActions({
    onSuccess: onActionSuccess,
  });

  return (
    <DataTable<CampaignRecipientRow>
      tableId="campaign-recipients-v2"
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      includeFields={[
        'email',
        'step',
        'status',
        'disposition',
        'sentAt',
        'openedAt',
        'clickedAt',
        'bouncedAt',
        'repliedAt',
        'replyCategory',
        'actions',
      ]}
      excludeFields={['id', 'recipient', 'pausedUntil', 'globallyExcluded']}
      columnOverrides={{
        email: { label: 'Email' },
        step: { label: 'Step' },
        disposition: {
          label: 'Disposition',
          render: (row) => (
            <Chip
              label={formatDispositionLabel(
                row.disposition,
                row.pausedUntil,
                row.repliedAt,
              )}
              title={getDispositionTooltip(
                row.disposition,
                row.pausedUntil,
                row.repliedAt,
              )}
              color={
                CAMPAIGN_RECIPIENT_DISPOSITION_COLORS[row.disposition] ??
                'default'
              }
              size="small"
              className="rounded-lg"
            />
          ),
        },
        status: {
          label: 'Engagement',
          render: (row) => {
            const status = row.status as CampaignRecipientEngagementStatus;

            return (
              <Chip
                label={CAMPAIGN_RECIPIENT_STATUS_LABELS[status] ?? row.status}
                color={CAMPAIGN_RECIPIENT_STATUS_COLORS[status] ?? 'default'}
                size="small"
                className="rounded-lg"
              />
            );
          },
        },
        sentAt: {
          label: 'Sent',
          render: (row) => formatTrackingTimestamp(row.sentAt),
        },
        openedAt: {
          label: 'Opened',
          render: (row) => formatTrackingTimestamp(row.openedAt),
        },
        clickedAt: {
          label: 'Clicked',
          render: (row) => formatTrackingTimestamp(row.clickedAt),
        },
        bouncedAt: {
          label: 'Bounced',
          render: (row) => formatTrackingTimestamp(row.bouncedAt),
        },
        repliedAt: {
          label: 'Replied',
          render: (row) => formatTrackingTimestamp(row.repliedAt),
        },
        replyCategory: {
          label: 'Reply',
          render: (row) => formatReplyCategoryLabel(row.replyCategory),
        },
        actions: {
          label: 'Actions',
          align: 'right',
          searchable: false,
          render: (row) => (
            <Box
              className="campaign-recipient-actions-cell"
              onClick={(event) => event.stopPropagation()}
            >
              <CampaignRecipientActions
                campaignId={campaignId}
                recipientId={row.id}
                email={row.email}
                contactDisposition={row.disposition}
                pausedUntil={row.pausedUntil}
                repliedAt={row.repliedAt}
                globallyExcluded={row.globallyExcluded}
                isUpdating={isUpdating}
                onPause={pauseRecipient}
                onStop={stopRecipient}
                onResume={resumeRecipient}
                onExclude={excludeRecipient}
              />
            </Box>
          ),
        },
      }}
      emptyMessage="No recipients in this campaign yet"
      noResultsMessage="No recipients match your search or filters."
      enableSearch={false}
      enablePagination={false}
      persistPreferences={false}
      onRowClick={(row) => onRowClick(row.recipient)}
    />
  );
}

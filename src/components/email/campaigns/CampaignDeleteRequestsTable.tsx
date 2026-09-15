'use client';

import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import CampaignDeleteRequestRowActions from '@/components/email/campaigns/CampaignDeleteRequestRowActions';
import DataTable from '@/components/data-table/DataTable';
import { useOrgPath } from '@/hooks/useOrgPath';
import { formatStatusLabel } from '@/lib/email/campaigns/detail-utils';
import type {
  CampaignDeleteRequest,
  CampaignDeleteRequestStatus,
  EmailCampaignStatus,
} from '@/lib/email/campaigns/types';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusChipColor(
  status: CampaignDeleteRequestStatus,
): 'default' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
}

interface CampaignDeleteRequestsTableProps {
  requests: CampaignDeleteRequest[];
  isLoading: boolean;
  emptyMessage: string;
  canApproveDelete: boolean;
  onApprove: (request: CampaignDeleteRequest) => void;
  onReject: (request: CampaignDeleteRequest) => void;
}

export default function CampaignDeleteRequestsTable({
  requests,
  isLoading,
  emptyMessage,
  canApproveDelete,
  onApprove,
  onReject,
}: CampaignDeleteRequestsTableProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();

  const getCampaignHref = useCallback(
    (campaignId: string | null) => {
      if (!campaignId) {
        return null;
      }

      return toOrgPath(`/email/campaigns/${campaignId}`);
    },
    [toOrgPath],
  );

  const columnOverrides = useMemo(
    () => ({
      campaignName: {
        label: 'CAMPAIGN',
        render: (row: CampaignDeleteRequest) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" className="font-medium">
              {row.campaignName || 'Unnamed campaign'}
            </Typography>
            {row.campaignStatus ? (
              <Typography variant="caption" color="text.secondary">
                {formatStatusLabel(row.campaignStatus as EmailCampaignStatus)}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      requestedByName: {
        label: 'REQUESTED BY',
        render: (row: CampaignDeleteRequest) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" className="font-medium">
              {row.requestedByName || 'Unknown user'}
            </Typography>
            {row.requestedByEmail ? (
              <Typography variant="caption" color="text.secondary">
                {row.requestedByEmail}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      reason: {
        label: 'REASON',
        render: (row: CampaignDeleteRequest) => (
          <Stack spacing={0.5}>
            <Typography variant="body2" className="line-clamp-3">
              {row.reason}
            </Typography>
            {row.reviewNote ? (
              <Typography variant="caption" color="text.secondary">
                Review note: {row.reviewNote}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      status: {
        label: 'STATUS',
        render: (row: CampaignDeleteRequest) => (
          <Chip
            size="small"
            label={row.status}
            color={statusChipColor(row.status)}
            variant="outlined"
          />
        ),
      },
      createdAt: {
        label: 'REQUESTED',
        render: (row: CampaignDeleteRequest) => formatDateTime(row.createdAt),
      },
    }),
    [],
  );

  return (
    <Paper className="overflow-hidden rounded-2xl">
      <DataTable<CampaignDeleteRequest>
        tableId="campaign-delete-requests"
        rows={requests}
        getRowId={(row) => row.id}
        excludeFields={[
          'id',
          'campaignId',
          'campaignStatus',
          'requestedByUserId',
          'requestedByEmail',
          'reviewedByUserId',
          'reviewedByName',
          'reviewNote',
          'reviewedAt',
          'updatedAt',
        ]}
        columnOverrides={columnOverrides}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        noResultsMessage="No delete requests match your search."
        searchPlaceholder="Search delete requests..."
        persistPreferences
        onRowClick={(row) => {
          const campaignHref = getCampaignHref(row.campaignId);

          if (campaignHref) {
            router.push(campaignHref);
          }
        }}
        rowActions={
          canApproveDelete
            ? (row) => (
                <CampaignDeleteRequestRowActions
                  request={row}
                  canApproveDelete={canApproveDelete}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              )
            : undefined
        }
      />
    </Paper>
  );
}

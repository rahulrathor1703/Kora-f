'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import DataTable from '@/components/data-table/DataTable';
import type {
  ProspectDeleteRequest,
  ProspectDeleteRequestStatus,
} from '@/lib/crm/prospects/types';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusChipColor(
  status: ProspectDeleteRequestStatus,
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

interface ProspectDeleteRequestsTableProps {
  requests: ProspectDeleteRequest[];
  isLoading: boolean;
  emptyMessage: string;
  canRequestDelete: boolean;
  canApproveDelete: boolean;
  currentUserId?: string;
  isCancelling: boolean;
  onApprove: (request: ProspectDeleteRequest) => void;
  onReject: (request: ProspectDeleteRequest) => void;
  onCancel: (request: ProspectDeleteRequest) => void;
}

export default function ProspectDeleteRequestsTable({
  requests,
  isLoading,
  emptyMessage,
  canRequestDelete,
  canApproveDelete,
  currentUserId,
  isCancelling,
  onApprove,
  onReject,
  onCancel,
}: ProspectDeleteRequestsTableProps) {
  const showRowActions = canApproveDelete || canRequestDelete;

  const columnOverrides = useMemo(
    () => ({
      prospectFullName: {
        label: 'PROSPECT',
        render: (row: ProspectDeleteRequest) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" className="font-medium">
              {row.prospectFullName || 'Unnamed prospect'}
            </Typography>
            {row.prospectEmail ? (
              <Typography variant="caption" color="text.secondary">
                {row.prospectEmail}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      requestedByName: {
        label: 'REQUESTED BY',
        render: (row: ProspectDeleteRequest) => (
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
        render: (row: ProspectDeleteRequest) => (
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
        render: (row: ProspectDeleteRequest) => (
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
        render: (row: ProspectDeleteRequest) => formatDateTime(row.createdAt),
      },
    }),
    [],
  );

  return (
    <Paper className="overflow-hidden rounded-2xl">
      <DataTable<ProspectDeleteRequest>
        tableId="prospect-delete-requests"
        rows={requests}
        getRowId={(row) => row.id}
        excludeFields={[
          'id',
          'prospectId',
          'prospectEmail',
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
        rowActions={
          showRowActions
            ? (row) => (
                <Stack
                  direction="row"
                  spacing={1}
                  className="flex-wrap justify-end"
                >
                  {canApproveDelete && row.status === 'pending' ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => onApprove(row)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => onReject(row)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {canRequestDelete &&
                  row.status === 'pending' &&
                  currentUserId === row.requestedByUserId ? (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => onCancel(row)}
                      disabled={isCancelling}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </Stack>
              )
            : undefined
        }
      />
    </Paper>
  );
}

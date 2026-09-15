'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import CrmHubShell from '@/components/crm/CrmHubShell';
import ProspectDeleteRequestsTable from '@/components/crm/prospects/ProspectDeleteRequestsTable';
import RejectProspectDeleteRequestDialog from '@/components/crm/prospects/RejectProspectDeleteRequestDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useSession } from '@/hooks/useAuth';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import {
  useDeleteRequestSummaryCounts,
  useProspectDeleteRequests,
} from '@/hooks/useProspectDeleteRequests';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type {
  ProspectDeleteRequest,
  ProspectDeleteRequestStatus,
} from '@/lib/crm/prospects/types';

type StatusFilter = ProspectDeleteRequestStatus | 'all';

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ProspectDeleteRequestsContent() {
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canRequestDelete = useHasPermission('prospects:request-delete');
  const canApproveDelete = useHasPermission('prospects:approve-delete');
  const { data: session } = useSession();
  const prospectsPath = toOrgPath('/crm/prospectus');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [rejectTarget, setRejectTarget] = useState<ProspectDeleteRequest | null>(
    null,
  );
  const [approveTarget, setApproveTarget] = useState<ProspectDeleteRequest | null>(
    null,
  );

  const query = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
    [statusFilter],
  );

  const {
    requests,
    isLoading,
    isApproving,
    isRejecting,
    isCancelling,
    approveDeleteRequest,
    rejectDeleteRequest,
    cancelDeleteRequest,
  } = useProspectDeleteRequests(query);
  const { data: summaryCounts } = useDeleteRequestSummaryCounts(
    canRequestDelete || canApproveDelete,
  );

  const emptyMessage =
    statusFilter === 'pending'
      ? 'No pending delete requests.'
      : 'No delete requests match this filter.';

  const headerActions = (
    <Button
      component={Link}
      href={prospectsPath}
      variant="outlined"
      startIcon={<ArrowBackIcon />}
    >
      Back to Prospects
    </Button>
  );

  async function handleApproveConfirm() {
    if (!approveTarget) {
      return;
    }

    try {
      await approveDeleteRequest(approveTarget.id);
      notifySuccess('Delete request approved');
      setApproveTarget(null);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to approve delete request'));
    }
  }

  async function handleRejectSubmit(reviewNote?: string) {
    if (!rejectTarget) {
      return;
    }

    try {
      await rejectDeleteRequest(rejectTarget.id, { reviewNote });
      notifySuccess('Delete request rejected');
      setRejectTarget(null);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to reject delete request'));
    }
  }

  async function handleCancel(request: ProspectDeleteRequest) {
    try {
      await cancelDeleteRequest(request.id);
      notifySuccess('Delete request cancelled');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to cancel delete request'));
    }
  }

  if (!canRequestDelete && !canApproveDelete) {
    return (
      <CrmHubShell actions={headerActions}>
        <Alert severity="warning" className="rounded-2xl">
          You do not have permission to view prospect delete requests.
        </Alert>
      </CrmHubShell>
    );
  }

  return (
    <CrmHubShell actions={headerActions}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" component="h1" className="font-bold">
            Delete requests
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            {canApproveDelete
              ? `${summaryCounts?.pendingReviewCount ?? 0} pending request${(summaryCounts?.pendingReviewCount ?? 0) === 1 ? '' : 's'} awaiting your review.`
              : `You have raised ${summaryCounts?.myRaisedCount ?? 0} delete request${(summaryCounts?.myRaisedCount ?? 0) === 1 ? '' : 's'}${(summaryCounts?.myRaisedPendingCount ?? 0) > 0 ? ` (${summaryCounts?.myRaisedPendingCount} pending)` : ''}.`}
          </Typography>
        </Box>

        <Tabs
          value={statusFilter}
          onChange={(_, value: StatusFilter) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <ProspectDeleteRequestsTable
          requests={requests}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          canRequestDelete={canRequestDelete}
          canApproveDelete={canApproveDelete}
          currentUserId={session?.id}
          isCancelling={isCancelling}
          onApprove={setApproveTarget}
          onReject={setRejectTarget}
          onCancel={(request) => void handleCancel(request)}
        />
      </Stack>

      <ConfirmDialog
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => void handleApproveConfirm()}
        variant="destructive"
        title="Approve delete request"
        description={
          <>
            Permanently delete{' '}
            <strong>{approveTarget?.prospectFullName || 'this prospect'}</strong>?
            <br />
            <br />
            Raised by{' '}
            <strong>{approveTarget?.requestedByName || 'Unknown user'}</strong>
            {approveTarget?.requestedByEmail
              ? ` (${approveTarget.requestedByEmail})`
              : ''}
            {approveTarget?.createdAt
              ? ` on ${formatDateTime(approveTarget.createdAt)}`
              : ''}
            .
            <br />
            <br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Approve & delete"
        isLoading={isApproving}
      />

      {rejectTarget ? (
        <RejectProspectDeleteRequestDialog
          open
          prospectName={rejectTarget.prospectFullName}
          isSubmitting={isRejecting}
          onClose={() => setRejectTarget(null)}
          onSubmit={handleRejectSubmit}
        />
      ) : null}
    </CrmHubShell>
  );
}

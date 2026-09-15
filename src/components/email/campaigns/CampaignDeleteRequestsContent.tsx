'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useMemo, useState } from 'react';
import CampaignDeleteRequestsTable from '@/components/email/campaigns/CampaignDeleteRequestsTable';
import RejectCampaignDeleteRequestDialog from '@/components/email/campaigns/RejectCampaignDeleteRequestDialog';
import EmailHubShell from '@/components/email/EmailHubShell';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useCampaignDeleteRequestSummaryCounts,
  useCampaignDeleteRequests,
} from '@/hooks/useCampaignDeleteRequests';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import type {
  CampaignDeleteRequest,
  CampaignDeleteRequestStatus,
} from '@/lib/email/campaigns/types';

type StatusFilter = CampaignDeleteRequestStatus | 'all';

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function CampaignDeleteRequestsContent() {
  const { notifyError, notifySuccess } = useNotify();
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const canApproveDelete = useHasPermission('email-campaigns:approve-delete');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [rejectTarget, setRejectTarget] = useState<CampaignDeleteRequest | null>(
    null,
  );
  const [approveTarget, setApproveTarget] = useState<CampaignDeleteRequest | null>(
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
    approveDeleteRequest,
    rejectDeleteRequest,
  } = useCampaignDeleteRequests(query);
  const { data: summaryCounts } = useCampaignDeleteRequestSummaryCounts(
    canRequestDelete || canApproveDelete,
  );

  const emptyMessage =
    statusFilter === 'pending'
      ? 'No pending delete requests.'
      : 'No delete requests match this filter.';

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

  const summaryDescription = canApproveDelete
    ? `${summaryCounts?.pendingReviewCount ?? 0} pending request${(summaryCounts?.pendingReviewCount ?? 0) === 1 ? '' : 's'} awaiting your review.`
    : `You have raised ${summaryCounts?.myRaisedCount ?? 0} delete request${(summaryCounts?.myRaisedCount ?? 0) === 1 ? '' : 's'}${(summaryCounts?.myRaisedPendingCount ?? 0) > 0 ? ` (${summaryCounts?.myRaisedPendingCount} pending)` : ''}.`;

  if (!canRequestDelete && !canApproveDelete) {
    return (
      <EmailHubShell hideHeader>
        <Stack spacing={3}>
          <SettingsSubPageHeader
            overline="Email settings"
            title="Delete requests"
            description="Review and manage campaign deletion requests."
            parentBack={{ href: '/email/settings', label: 'Settings' }}
            showPlatformBackLink={false}
          />
          <Alert severity="warning" className="rounded-2xl">
            You do not have permission to view campaign delete requests.
          </Alert>
        </Stack>
      </EmailHubShell>
    );
  }

  return (
    <EmailHubShell hideHeader>
      <Stack spacing={3}>
        <SettingsSubPageHeader
          overline="Email settings"
          title="Delete requests"
          description={summaryDescription}
          parentBack={{ href: '/email/settings', label: 'Settings' }}
          showPlatformBackLink={false}
        />

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

        <CampaignDeleteRequestsTable
          requests={requests}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          canApproveDelete={canApproveDelete}
          onApprove={setApproveTarget}
          onReject={setRejectTarget}
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
            <strong>{approveTarget?.campaignName || 'this campaign'}</strong>?
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
        <RejectCampaignDeleteRequestDialog
          open
          campaignName={rejectTarget.campaignName}
          isSubmitting={isRejecting}
          onClose={() => setRejectTarget(null)}
          onSubmit={handleRejectSubmit}
        />
      ) : null}
    </EmailHubShell>
  );
}

'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import CampaignDetailHeader from '@/components/email/campaigns/detail/CampaignDetailHeader';
import CampaignDetailTabs from '@/components/email/campaigns/detail/CampaignDetailTabs';
import CampaignMetricsBar from '@/components/email/campaigns/detail/CampaignMetricsBar';
import CampaignTrackingStatusBanner from '@/components/email/campaigns/detail/CampaignTrackingStatusBanner';
import RequestCampaignDeleteDialog from '@/components/email/campaigns/RequestCampaignDeleteDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useCampaignDeleteRequests } from '@/hooks/useCampaignDeleteRequests';
import { useCampaignDetailLabels } from '@/hooks/useCampaignDetailLabels';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  useCampaignTrackingHealth,
  useDeleteEmailCampaign,
  useEmailCampaign,
  useEmailCampaignProgress,
  useUpdateEmailCampaign,
  useUpdateEmailCampaignStatus,
} from '@/hooks/useEmailCampaigns';
import { getApiErrorMessage } from '@/lib/api';
import { getManualCampaignStatusTransitionError } from '@/lib/email/campaigns/status-transitions';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';
import type { CampaignAdvancedFieldValues } from '@/components/email/campaigns/shared/CampaignAdvancedFieldsDrawer';

interface CampaignDetailContentProps {
  campaignId: string;
}

export default function CampaignDetailContent({
  campaignId,
}: CampaignDetailContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifySuccess, notifyError } = useNotify();
  const [deleteRequestOpen, setDeleteRequestOpen] = useState(false);
  const [directDeleteOpen, setDirectDeleteOpen] = useState(false);
  const canUpdateCampaigns = useHasPermission('email-campaigns:update');
  const canDirectDelete = useHasPermission('email-campaigns:delete');
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const { data: campaign, error, isLoading, refetch } = useEmailCampaign(campaignId);
  const { updateCampaign, isUpdating } = useUpdateEmailCampaign();
  const { updateCampaignStatus, isUpdatingStatus } = useUpdateEmailCampaignStatus({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { deleteCampaign, isDeleting } = useDeleteEmailCampaign();
  const {
    data: progress,
    isLoading: isProgressLoading,
  } = useEmailCampaignProgress(campaignId, { campaignStatus: campaign?.status });
  const {
    data: trackingStatus,
    isLoading: isTrackingStatusLoading,
  } = useCampaignTrackingHealth(campaignId);
  const labels = useCampaignDetailLabels(campaign);
  const {
    requests: pendingDeleteRequests,
    createDeleteRequest,
    isCreating: isCreatingDeleteRequest,
    refetch: refetchDeleteRequests,
  } = useCampaignDeleteRequests({ status: 'pending', campaignId });

  const hasPendingDeleteRequest = useMemo(
    () => pendingDeleteRequests.some((request) => request.status === 'pending'),
    [pendingDeleteRequests],
  );

  const pendingDeleteRequest = useMemo(
    () =>
      pendingDeleteRequests.find((request) => request.status === 'pending') ??
      null,
    [pendingDeleteRequests],
  );

  const pendingDeleteRequestLabel = useMemo(() => {
    if (!hasPendingDeleteRequest) {
      return undefined;
    }

    return pendingDeleteRequest?.requestedByName
      ? `Delete request pending — raised by ${pendingDeleteRequest.requestedByName}`
      : 'Delete request pending';
  }, [hasPendingDeleteRequest, pendingDeleteRequest]);

  const {
    pauseCampaign,
    stopCampaign,
    resumeCampaign,
    isUpdating: isUpdatingCampaignActions,
  } = useCampaignActions({
    onSuccess: async () => {
      await refetch();
    },
  });

  async function handleStatusChange(nextStatus: EmailCampaignStatus) {
    if (!campaign) {
      return;
    }

    const transitionError = getManualCampaignStatusTransitionError(
      campaign.status,
      nextStatus,
    );

    if (transitionError) {
      notifyError(transitionError);
      return;
    }

    try {
      await updateCampaignStatus(campaign.id, nextStatus);
      notifySuccess('Campaign status updated');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to update campaign status'));
    }
  }

  const advancedInitialValues = useMemo<CampaignAdvancedFieldValues>(
    () => ({
      type: campaign?.campaignTypeId ?? '',
      brand: campaign?.brandId ?? '',
      region: campaign?.regionId ?? '',
      customFieldValues: campaign?.customFieldValues ?? {},
    }),
    [
      campaign?.brandId,
      campaign?.campaignTypeId,
      campaign?.customFieldValues,
      campaign?.regionId,
    ],
  );

  async function handleSaveAdvanced(values: CampaignAdvancedFieldValues) {
    if (!campaign) {
      return;
    }

    const normalizedCustomFieldValues = Object.fromEntries(
      Object.entries(values.customFieldValues).filter(([, value]) => value.trim()),
    );

    await updateCampaign(campaign.id, {
      campaignTypeId: values.type || null,
      brandId: values.brand || null,
      regionId: values.region || null,
      customFieldValues: normalizedCustomFieldValues,
    });
    await refetch();
    notifySuccess('Campaign classification updated');
  }

  async function handleCreateDeleteRequest(reason: string) {
    try {
      await createDeleteRequest({ campaignId, reason });
      await refetchDeleteRequests();
      notifySuccess('Delete request submitted');
      setDeleteRequestOpen(false);
    } catch (saveError) {
      notifyError(
        getApiErrorMessage(saveError, 'Unable to submit delete request'),
      );
      throw saveError;
    }
  }

  async function handleDirectDeleteConfirm() {
    if (!campaign) {
      return;
    }

    try {
      await deleteCampaign(campaign.id);
      notifySuccess('Campaign deleted');
      router.push(toOrgPath('/email/campaigns'));
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to delete campaign'));
    }
  }

  if (error && !isLoading) {
    return (
      <Stack spacing={3}>
        <SettingsNavButton href="/email/campaigns" label="Back to campaigns" />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              Campaign not found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              This campaign may have been removed or you may not have access to
              view it.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <CampaignDetailHeader
        campaign={campaign}
        labels={labels}
        isLoading={isLoading}
        canUpdate={canUpdateCampaigns}
        onContinueEditing={
          campaign?.status === 'draft'
            ? () => router.push(toOrgPath(`/email/campaigns/${campaignId}/edit`))
            : undefined
        }
        isUpdatingStatus={isUpdatingStatus || isUpdatingCampaignActions}
        onStatusChange={handleStatusChange}
        onPause={async (pausedUntil) => {
          if (!campaign) {
            return;
          }

          await pauseCampaign(campaign.id, campaign.name, pausedUntil);
        }}
        onStop={async () => {
          if (!campaign) {
            return;
          }

          await stopCampaign(campaign.id, campaign.name);
        }}
        onResume={async (options) => {
          if (!campaign) {
            return;
          }

          await resumeCampaign(campaign.id, campaign.name, options);
        }}
      />

      {campaign?.status === 'draft' ? (
        <Alert severity="info" className="rounded-2xl">
          This campaign is still a draft. Continue editing to finish setup and
          schedule it, or delete it if you no longer need it.
        </Alert>
      ) : null}

      {campaign?.status !== 'draft' ? (
        <CampaignTrackingStatusBanner
          status={trackingStatus}
          isLoading={isTrackingStatusLoading}
        />
      ) : null}

      <CampaignMetricsBar
        engagement={progress?.engagement}
        timeline={progress?.timeline}
        isLoading={isLoading || isProgressLoading}
      />

      {campaign ? (
        <Box>
          <CampaignDetailTabs
            campaign={campaign}
            labels={labels}
            canUpdate={canUpdateCampaigns}
            advancedInitialValues={advancedInitialValues}
            onSaveAdvanced={handleSaveAdvanced}
            isSavingAdvanced={isUpdating}
            canDirectDelete={canDirectDelete}
            canRequestDelete={canRequestDelete}
            hasPendingDeleteRequest={hasPendingDeleteRequest}
            pendingDeleteRequestLabel={pendingDeleteRequestLabel}
            onDirectDelete={() => setDirectDeleteOpen(true)}
            onRequestDelete={() => setDeleteRequestOpen(true)}
            isDeleting={isDeleting}
          />
        </Box>
      ) : isLoading ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-6">
            <Typography variant="body2" color="text.secondary">
              Loading campaign details…
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <RequestCampaignDeleteDialog
        open={deleteRequestOpen}
        campaignName={campaign?.name ?? ''}
        isSubmitting={isCreatingDeleteRequest}
        onClose={() => setDeleteRequestOpen(false)}
        onSubmit={handleCreateDeleteRequest}
      />

      <ConfirmDialog
        open={directDeleteOpen}
        title="Delete campaign"
        description={
          <>
            Delete <strong>{campaign?.name ?? 'this campaign'}</strong> permanently?
            This action cannot be undone.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        isLoading={isDeleting}
        onClose={() => setDirectDeleteOpen(false)}
        onConfirm={() => void handleDirectDeleteConfirm()}
      />
    </Stack>
  );
}

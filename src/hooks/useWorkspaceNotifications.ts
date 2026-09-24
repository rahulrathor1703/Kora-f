'use client';

import { useMemo } from 'react';
import { useCampaignDeleteRequestSummaryCounts } from '@/hooks/useCampaignDeleteRequests';
import { useHasPermission } from '@/hooks/useHasPermission';
import {
  buildEmailCampaignDeleteRequestNotification,
  type WorkspaceNotification,
} from '@/lib/notifications/workspace-notifications';

export function useWorkspaceNotifications(): WorkspaceNotification[] {
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const canApproveDelete = useHasPermission('email-campaigns:approve-delete');
  const canViewEmailDeleteRequests = canRequestDelete || canApproveDelete;

  const { data: emailDeleteRequestSummary } = useCampaignDeleteRequestSummaryCounts(
    canViewEmailDeleteRequests,
  );

  return useMemo(() => {
    if (!canViewEmailDeleteRequests || !emailDeleteRequestSummary) {
      return [];
    }

    const emailNotification = buildEmailCampaignDeleteRequestNotification({
      canApproveDelete,
      pendingReviewCount: emailDeleteRequestSummary.pendingReviewCount,
      myRaisedPendingCount: emailDeleteRequestSummary.myRaisedPendingCount,
    });

    return emailNotification ? [emailNotification] : [];
  }, [canApproveDelete, canViewEmailDeleteRequests, emailDeleteRequestSummary]);
}

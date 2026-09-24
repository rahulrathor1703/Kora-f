'use client';

import { useMemo } from 'react';
import { useCampaignDeleteRequestSummaryCounts } from '@/hooks/useCampaignDeleteRequests';
import { useHasPermission } from '@/hooks/useHasPermission';
import {
  EMAIL_DELETE_REQUESTS_HREF,
  hasEmailCampaignDeleteRequestNotifications,
} from '@/lib/notifications/workspace-notifications';

const EMAIL_SETTINGS_HREF = '/email/settings';

export function useNavNotificationDots(): Record<string, boolean> {
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const canApproveDelete = useHasPermission('email-campaigns:approve-delete');
  const canViewEmailDeleteRequests = canRequestDelete || canApproveDelete;

  const { data: emailDeleteRequestSummary } = useCampaignDeleteRequestSummaryCounts(
    canViewEmailDeleteRequests,
  );

  return useMemo((): Record<string, boolean> => {
    if (
      !canViewEmailDeleteRequests ||
      !emailDeleteRequestSummary ||
      !hasEmailCampaignDeleteRequestNotifications({
        canApproveDelete,
        pendingReviewCount: emailDeleteRequestSummary.pendingReviewCount,
        myRaisedPendingCount: emailDeleteRequestSummary.myRaisedPendingCount,
      })
    ) {
      return {};
    }

    return {
      [EMAIL_SETTINGS_HREF]: true,
      [EMAIL_DELETE_REQUESTS_HREF]: true,
    };
  }, [canApproveDelete, canViewEmailDeleteRequests, emailDeleteRequestSummary]);
}

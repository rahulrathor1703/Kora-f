export interface WorkspaceNotification {
  id: string;
  title: string;
  description: string;
  href: string;
}

export const EMAIL_DELETE_REQUESTS_HREF = '/email/settings/delete-requests';

export function buildEmailCampaignDeleteRequestNotification(input: {
  canApproveDelete: boolean;
  pendingReviewCount: number;
  myRaisedPendingCount: number;
}): WorkspaceNotification | null {
  const { canApproveDelete, pendingReviewCount, myRaisedPendingCount } = input;

  if (canApproveDelete && pendingReviewCount > 0) {
    const countLabel =
      pendingReviewCount === 1 ? '1 pending request' : `${pendingReviewCount} pending requests`;

    return {
      id: 'email-campaign-delete-requests-review',
      title: 'Campaign delete requests',
      description: `${countLabel} awaiting your review.`,
      href: EMAIL_DELETE_REQUESTS_HREF,
    };
  }

  if (!canApproveDelete && myRaisedPendingCount > 0) {
    const countLabel =
      myRaisedPendingCount === 1
        ? '1 of your requests'
        : `${myRaisedPendingCount} of your requests`;

    return {
      id: 'email-campaign-delete-requests-pending',
      title: 'Campaign delete requests',
      description: `${countLabel} still pending approval.`,
      href: EMAIL_DELETE_REQUESTS_HREF,
    };
  }

  return null;
}

export function hasEmailCampaignDeleteRequestNotifications(input: {
  canApproveDelete: boolean;
  pendingReviewCount: number;
  myRaisedPendingCount: number;
}): boolean {
  return buildEmailCampaignDeleteRequestNotification(input) !== null;
}

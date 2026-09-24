'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsHubCard from '@/components/settings/SettingsHubCard';
import { useSession } from '@/hooks/useAuth';
import { useCampaignDeleteRequestSummaryCounts } from '@/hooks/useCampaignDeleteRequests';
import { useHasPermission } from '@/hooks/useHasPermission';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import {
  emailSettingsNavItems,
  emailSettingsOperationalNavItems,
  type EmailSettingsNavItem,
} from '@/lib/email/settings-navigation';
import {
  EMAIL_DELETE_REQUESTS_HREF,
  buildEmailCampaignDeleteRequestNotification,
  hasEmailCampaignDeleteRequestNotifications,
} from '@/lib/notifications/workspace-notifications';
import { hasNavPermission } from '@/lib/workspace-navigation';

interface SettingsHubSectionProps {
  title: string;
  description: string;
  items: EmailSettingsNavItem[];
  getBadge?: (item: EmailSettingsNavItem) => string | undefined;
  getShowNotificationDot?: (item: EmailSettingsNavItem) => boolean;
}

function SettingsHubSection({
  title,
  description,
  items,
  getBadge,
  getShowNotificationDot,
}: SettingsHubSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" component="h2" className="font-semibold text-foreground">
          {title}
        </Typography>
        <Typography variant="body2" className="mt-1 max-w-2xl text-pretty text-muted">
          {description}
        </Typography>
      </Box>

      <Box className="settings-hub-grid">
        {items.map((item) => (
          <SettingsHubCard
            key={item.href}
            href={item.href}
            label={item.label}
            description={item.description}
            icon={item.icon}
            badge={getBadge?.(item)}
            showNotificationDot={getShowNotificationDot?.(item) ?? false}
          />
        ))}
      </Box>
    </Stack>
  );
}

export default function EmailSettingsContent() {
  const { data: session } = useSession();
  const canManageEmailConfig = useHasPermission('email-config:read');
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const canApproveDelete = useHasPermission('email-campaigns:approve-delete');
  const permissions = session?.permissions ?? [];
  const isSuperAdmin = isPlatformOwner(session);
  const { data: deleteRequestSummary } = useCampaignDeleteRequestSummaryCounts(
    canRequestDelete || canApproveDelete,
  );

  const visibleOperationalItems = emailSettingsOperationalNavItems.filter((item) =>
    hasNavPermission(item, permissions, isSuperAdmin),
  );

  const configItems = canManageEmailConfig ? emailSettingsNavItems : [];

  const showDeleteRequestDot =
    Boolean(deleteRequestSummary) &&
    hasEmailCampaignDeleteRequestNotifications({
      canApproveDelete,
      pendingReviewCount: deleteRequestSummary?.pendingReviewCount ?? 0,
      myRaisedPendingCount: deleteRequestSummary?.myRaisedPendingCount ?? 0,
    });

  const deleteRequestNotification = deleteRequestSummary
    ? buildEmailCampaignDeleteRequestNotification({
        canApproveDelete,
        pendingReviewCount: deleteRequestSummary.pendingReviewCount,
        myRaisedPendingCount: deleteRequestSummary.myRaisedPendingCount,
      })
    : null;

  const allItems = [...visibleOperationalItems, ...configItems];

  if (allItems.length === 0) {
    return (
      <Box className="surface-panel rounded-2xl p-6 md:p-8">
        <Typography variant="body1" className="text-muted">
          You do not have permission to view email settings.
        </Typography>
      </Box>
    );
  }

  const showGroupedSections =
    visibleOperationalItems.length > 0 && configItems.length > 0;

  function getDeleteRequestBadge(item: EmailSettingsNavItem): string | undefined {
    if (item.href !== EMAIL_DELETE_REQUESTS_HREF || !deleteRequestNotification) {
      return undefined;
    }

    if (canApproveDelete && (deleteRequestSummary?.pendingReviewCount ?? 0) > 0) {
      const count = deleteRequestSummary?.pendingReviewCount ?? 0;
      return count === 1 ? '1 pending' : `${count} pending`;
    }

    if (!canApproveDelete && (deleteRequestSummary?.myRaisedPendingCount ?? 0) > 0) {
      const count = deleteRequestSummary?.myRaisedPendingCount ?? 0;
      return count === 1 ? '1 awaiting approval' : `${count} awaiting approval`;
    }

    return undefined;
  }

  function getDeleteRequestDot(item: EmailSettingsNavItem): boolean {
    return item.href === EMAIL_DELETE_REQUESTS_HREF && showDeleteRequestDot;
  }

  if (!showGroupedSections) {
    return (
      <Box className="settings-hub-grid">
        {allItems.map((item) => (
          <SettingsHubCard
            key={item.href}
            href={item.href}
            label={item.label}
            description={item.description}
            icon={item.icon}
            badge={getDeleteRequestBadge(item)}
            showNotificationDot={getDeleteRequestDot(item)}
          />
        ))}
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <SettingsHubSection
        title="Operational workflows"
        description="Review deletion requests and other day-to-day email operations."
        items={visibleOperationalItems}
        getBadge={getDeleteRequestBadge}
        getShowNotificationDot={getDeleteRequestDot}
      />

      <SettingsHubSection
        title="Campaign configuration"
        description="Define the types, brands, and regions used when creating campaigns."
        items={configItems}
      />
    </Stack>
  );
}

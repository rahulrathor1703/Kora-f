'use client';

import type { CampaignTrackingHealth, CampaignTrackingStatus } from '@/lib/email/campaigns/progress-types';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

interface CampaignTrackingStatusBannerProps {
  status: CampaignTrackingStatus | CampaignTrackingHealth | null | undefined;
  isLoading?: boolean;
}

export default function CampaignTrackingStatusBanner({
  status,
  isLoading = false,
}: CampaignTrackingStatusBannerProps) {
  if (isLoading || !status) {
    return null;
  }

  const alerts: Array<{ severity: 'error' | 'warning'; message: string }> = [];
  const health =
    'messagesMissingProviderMessageId' in status ? status : null;

  if (!status.isPubliclyReachable) {
    alerts.push({
      severity: 'error',
      message:
        `Open and click tracking require a public TRACKING_BASE_URL (currently ${status.trackingBaseUrl}). ` +
        `Try ${status.recommendedTrackingBaseUrl}, restart the backend, then send a new test email.`,
    });
  }

  if (!status.trackingEndpointVerified) {
    alerts.push({
      severity: 'error',
      message:
        status.trackingEndpointError ??
        `The tracking open endpoint is not reachable at ${status.trackingBaseUrl}/track/open/…. ` +
          `Set TRACKING_BASE_URL to ${status.recommendedTrackingBaseUrl}, restart the backend, and send a new test email.`,
    });
  }

  if (!status.bounceMonitoringEnabled) {
    alerts.push({
      severity: 'warning',
      message:
        'Bounce and reply detection require at least one active mailbox with inbox access. Reconnect OAuth mailboxes after updating scopes, or add an app-password SMTP mailbox.',
    });
  }

  if (status.mailboxesNeedingReauth.length > 0) {
    alerts.push({
      severity: 'warning',
      message:
        `Reconnect these OAuth mailboxes to enable bounce/reply monitoring: ${status.mailboxesNeedingReauth.join(', ')}.`,
    });
  }

  if (health && health.messagesMissingProviderMessageId > 0) {
    alerts.push({
      severity: 'warning',
      message:
        `${health.messagesMissingProviderMessageId} sent message(s) in this campaign are missing a provider Message-ID — bounce/reply matching may be less accurate until new emails are sent.`,
    });
  }

  if (health) {
    const staleMailboxes = health.mailboxes.filter(
      (mailbox) => mailbox.monitoringEnabled && !mailbox.lastSyncedAt,
    );

    if (staleMailboxes.length > 0) {
      alerts.push({
        severity: 'warning',
        message:
          `Inbox polling has not synced yet for: ${staleMailboxes.map((mailbox) => mailbox.email).join(', ')}. Wait for the next poll.`,
      });
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      {alerts.map((alert) => (
        <Alert key={alert.message} severity={alert.severity} className="rounded-2xl">
          {alert.message}
        </Alert>
      ))}
    </Stack>
  );
}

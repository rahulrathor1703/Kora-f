'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Never';
  }

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const syncStatusColor: Record<
  SenderMailbox['config']['syncStatus'],
  'success' | 'warning' | 'error'
> = {
  connected: 'success',
  pending: 'warning',
  error: 'error',
};

interface MailboxConnectionDetailsProps {
  mailbox: SenderMailbox;
  showIntro?: boolean;
}

export default function MailboxConnectionDetails({
  mailbox,
  showIntro = true,
}: MailboxConnectionDetailsProps) {
  return (
    <Stack spacing={2.5} className="pt-1">
      {showIntro ? (
        <Typography variant="body2" color="text.secondary">
          Read-only view of connection settings for {mailbox.email}.
        </Typography>
      ) : null}

      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" className="w-32">
            Sync status
          </Typography>
          <Chip
            label={mailbox.config.syncStatus}
            size="small"
            color={syncStatusColor[mailbox.config.syncStatus]}
            className="rounded-lg capitalize"
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
            Last synced
          </Typography>
          <Typography variant="body2">
            {formatTimestamp(mailbox.config.lastSyncedAt)}
          </Typography>
        </Stack>

        {mailbox.config.providerLabel ? (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
              Connection
            </Typography>
            <Typography variant="body2">{mailbox.config.providerLabel}</Typography>
          </Stack>
        ) : null}

        {mailbox.config.smtpHost ? (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
              SMTP host
            </Typography>
            <Typography variant="body2" className="font-mono">
              {mailbox.config.smtpHost}
            </Typography>
          </Stack>
        ) : null}

        {mailbox.config.smtpPort !== undefined ? (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
              SMTP port
            </Typography>
            <Typography variant="body2" className="font-mono">
              {mailbox.config.smtpPort}
            </Typography>
          </Stack>
        ) : null}

        {mailbox.config.smtpUser ? (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
              SMTP user
            </Typography>
            <Typography variant="body2" className="font-mono">
              {mailbox.config.smtpUser}
            </Typography>
          </Stack>
        ) : null}

        {mailbox.config.smtpSecure !== undefined ? (
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
              TLS/SSL
            </Typography>
            <Typography variant="body2">
              {mailbox.config.smtpSecure ? 'Enabled' : 'Disabled'}
            </Typography>
          </Stack>
        ) : null}

        <Stack direction="row" spacing={1}>
          <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
            Daily limit
          </Typography>
          <Typography variant="body2">
            {mailbox.dailySendsUsed} / {mailbox.dailySendLimit} sends used today
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
            Warmup
          </Typography>
          <Typography variant="body2">
            {mailbox.warmupEnabled ? 'Enabled' : 'Disabled'}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import MailboxDeliverabilityPanel from '@/components/email/mailboxes/detail/MailboxDeliverabilityPanel';
import MailboxDailyCapacityPanel from '@/components/email/mailboxes/detail/overview/MailboxDailyCapacityPanel';
import MailboxSenderStatusPanel from '@/components/email/mailboxes/detail/overview/MailboxSenderStatusPanel';
import { getMailboxDeliverability } from '@/lib/email/mailbox-deliverability';
import type {
  MailboxCampaignsResponse,
  SenderMailboxDetail,
} from '@/lib/email/mailbox-types';

interface OverviewTabProps {
  mailbox: SenderMailboxDetail;
  campaignsData: MailboxCampaignsResponse | null;
  isCampaignsLoading: boolean;
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OverviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" className="font-bold tracking-tight">
          {title}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
            {description}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Stack>
  );
}

export default function OverviewTab({
  mailbox,
  campaignsData,
  isCampaignsLoading,
}: OverviewTabProps) {
  const deliverability = getMailboxDeliverability(mailbox);
  const deliverabilityChecks = {
    spf: deliverability.spfEnabled,
    dkim: deliverability.dkimEnabled,
    dmarc: deliverability.dmarcEnabled,
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2.5}>
        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <MailboxDailyCapacityPanel mailbox={mailbox} isLoading={false} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <MailboxSenderStatusPanel
              campaignsData={campaignsData}
              isLoading={isCampaignsLoading}
            />
          </Grid>
        </Grid>
      </Stack>

      <OverviewSection
        title="Mailbox details"
        description="Identity, deliverability signals, and account metadata"
      >
        <Box className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
          <Card className="dashboard-panel flex h-full flex-col rounded-[24px] shadow-none">
            <CardContent className="flex h-full flex-col p-5">
              <Typography variant="subtitle1" className="mb-3 font-bold">
                Sender identity
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
                    Email
                  </Typography>
                  <Typography variant="body2">{mailbox.email}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
                    From name
                  </Typography>
                  <Typography variant="body2">{mailbox.fromName}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
                    Provider
                  </Typography>
                  <Typography variant="body2" className="capitalize">
                    {mailbox.provider}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
                    Status
                  </Typography>
                  <Typography variant="body2" className="capitalize">
                    {mailbox.status}
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
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
                    Created
                  </Typography>
                  <Typography variant="body2">{formatTimestamp(mailbox.createdAt)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" className="w-32 shrink-0">
                    Last updated
                  </Typography>
                  <Typography variant="body2">{formatTimestamp(mailbox.updatedAt)}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card className="dashboard-panel flex h-full flex-col rounded-[24px] shadow-none">
            <CardContent className="flex h-full min-h-0 flex-col p-5">
              <MailboxDeliverabilityPanel checks={deliverabilityChecks} />
            </CardContent>
          </Card>
        </Box>
      </OverviewSection>
    </Stack>
  );
}

'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import MailboxSenderStatusChart from '@/components/email/mailboxes/detail/overview/MailboxSenderStatusChart';
import { buildMailboxSenderStatusSlices } from '@/lib/email/mailbox-overview-utils';
import type { MailboxCampaignsResponse } from '@/lib/email/mailbox-types';

interface MailboxSenderStatusPanelProps {
  campaignsData: MailboxCampaignsResponse | null;
  isLoading: boolean;
}

export default function MailboxSenderStatusPanel({
  campaignsData,
  isLoading,
}: MailboxSenderStatusPanelProps) {
  const slices = useMemo(
    () => buildMailboxSenderStatusSlices(campaignsData),
    [campaignsData],
  );

  return (
    <Box className="dashboard-panel flex h-full min-h-[280px] w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="mb-1 shrink-0 font-bold">
        Sender status breakdown
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mb-4 shrink-0">
        Active, paused, and stopped assignments across campaigns
      </Typography>

      {isLoading ? (
        <Skeleton height={240} className="rounded-2xl" />
      ) : (
        <Box className="flex flex-1 flex-col justify-center">
          <MailboxSenderStatusChart slices={slices} />
        </Box>
      )}
    </Box>
  );
}

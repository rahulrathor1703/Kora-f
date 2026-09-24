'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import MailboxDailyCapacityChart from '@/components/email/mailboxes/detail/overview/MailboxDailyCapacityChart';
import { buildMailboxCapacitySlices } from '@/lib/email/mailbox-overview-utils';
import type { SenderMailboxDetail } from '@/lib/email/mailbox-types';

interface MailboxDailyCapacityPanelProps {
  mailbox: SenderMailboxDetail;
  isLoading: boolean;
}

export default function MailboxDailyCapacityPanel({
  mailbox,
  isLoading,
}: MailboxDailyCapacityPanelProps) {
  const slices = useMemo(() => buildMailboxCapacitySlices(mailbox), [mailbox]);

  return (
    <Box className="dashboard-panel flex h-full min-h-[280px] w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="mb-1 shrink-0 font-bold">
        Daily send capacity
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mb-4 shrink-0">
        How much of today&apos;s sending limit has been used
      </Typography>

      {isLoading ? (
        <Skeleton height={240} className="rounded-2xl" />
      ) : (
        <Box className="flex flex-1 flex-col justify-center">
          <MailboxDailyCapacityChart
            slices={slices}
            dailyLimit={mailbox.dailySendLimit}
          />
        </Box>
      )}
    </Box>
  );
}

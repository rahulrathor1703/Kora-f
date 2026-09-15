'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import CampaignActivityChart from '@/components/email/campaigns/detail/progress/CampaignActivityChart';
import { useCampaignDailyEvents } from '@/hooks/useEmailCampaigns';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';
import { mapDailyActivityPoints } from '@/lib/email/campaigns/activity-chart-utils';

interface CampaignActivityPanelProps {
  campaignId: string;
  campaignStatus: EmailCampaignStatus;
}

export default function CampaignActivityPanel({
  campaignId,
  campaignStatus,
}: CampaignActivityPanelProps) {
  const { data, isLoading } = useCampaignDailyEvents(campaignId, {
    campaignStatus,
  });

  const points = useMemo(
    () => mapDailyActivityPoints(data?.points ?? []),
    [data?.points],
  );

  const hasData = points.length > 0;

  return (
    <Box className="dashboard-panel flex w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="mb-1 shrink-0 font-bold">
        Daily activity
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mb-4 shrink-0">
        Sends, opens, clicks, replies, bounces, and unsubscribes over time
      </Typography>

      {isLoading ? (
        <Skeleton height={260} className="rounded-2xl" />
      ) : hasData ? (
        <CampaignActivityChart points={points} />
      ) : (
        <Box className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <Typography variant="caption" color="text.secondary" className="max-w-sm">
            Activity trends will appear here as campaign events are recorded.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

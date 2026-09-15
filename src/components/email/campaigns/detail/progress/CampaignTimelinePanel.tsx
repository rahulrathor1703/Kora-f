'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import CampaignTimelineChart from '@/components/email/campaigns/detail/progress/CampaignTimelineChart';
import { useCampaignDailyEvents } from '@/hooks/useEmailCampaigns';
import { formatDetailDate } from '@/lib/email/campaigns/detail-utils';
import type { EmailCampaignProgressTimeline } from '@/lib/email/campaigns/progress-types';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';
import { buildDeliveryTrendPoints } from '@/lib/email/campaigns/delivery-trend-chart-utils';

interface CampaignTimelinePanelProps {
  campaignId: string;
  campaignStatus: EmailCampaignStatus;
  timeline: EmailCampaignProgressTimeline;
}

interface TimelineStatProps {
  label: string;
  value: string;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function TimelineStat({ label, value }: TimelineStatProps) {
  return (
    <Box className="min-w-0">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', fontSize: '0.6875rem', lineHeight: 1.35 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        className="font-semibold tracking-tight"
        sx={{
          fontSize: '0.875rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.35,
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function CampaignTimelinePanel({
  campaignId,
  campaignStatus,
  timeline,
}: CampaignTimelinePanelProps) {
  const { data: dailyEvents, isLoading } = useCampaignDailyEvents(campaignId, {
    campaignStatus,
  });
  const percentComplete = clampPercent(timeline.percentComplete);
  const estCompletion = timeline.isComplete
    ? 'Complete'
    : formatDetailDate(timeline.estimatedEndAt);

  const chartPoints = useMemo(
    () => buildDeliveryTrendPoints(timeline, dailyEvents?.points ?? []),
    [dailyEvents?.points, timeline],
  );

  const hasChart = chartPoints.length > 0;

  return (
    <Box className="dashboard-panel rounded-2xl p-4 md:p-5">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
      >
        <Box className="min-w-0">
          <Typography variant="subtitle1" className="font-bold">
            Campaign timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-0.5">
            {timeline.sentCount.toLocaleString()} sent of{' '}
            {timeline.totalContacts.toLocaleString()} contacts
          </Typography>
        </Box>
        <Chip
          size="small"
          label={timeline.isComplete ? 'Complete' : `${percentComplete}% done`}
          color={timeline.isComplete ? 'success' : 'primary'}
          variant={timeline.isComplete ? 'filled' : 'outlined'}
          className="self-start rounded-lg font-medium sm:self-auto"
        />
      </Stack>

      <Box className="mb-4">
        {isLoading ? (
          <Skeleton height={320} className="rounded-2xl" />
        ) : hasChart ? (
          <CampaignTimelineChart
            points={chartPoints}
            totalContacts={timeline.totalContacts}
          />
        ) : (
          <Box className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface-muted/35 px-4 text-center">
            <Typography variant="body2" color="text.secondary" className="max-w-sm">
              Delivery trends will appear once the campaign has a launch date and sending
              activity.
            </Typography>
          </Box>
        )}
      </Box>

      <Box className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-surface-border pt-3.5 md:grid-cols-4">
        <TimelineStat
          label="Launch date"
          value={formatDetailDate(timeline.launchAt)}
        />
        <TimelineStat label="Days running" value={`${timeline.daysRunning}d`} />
        <TimelineStat
          label="Contacts left"
          value={timeline.contactsLeft.toLocaleString()}
        />
        <TimelineStat label="Est. completion" value={estCompletion} />
      </Box>
    </Box>
  );
}

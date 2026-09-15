'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CampaignTimelineChart from '@/components/email/campaigns/detail/progress/CampaignTimelineChart';
import type { EmailDashboardPerformance } from '@/hooks/useEmailDashboardSummary';
import type { SendVolumeSideMetricRow } from '@/lib/email/dashboard/send-volume-panel';

interface EmailDashboardPerformancePanelProps {
  performance: EmailDashboardPerformance;
}

function SendVolumeBottomMetric({ row }: { row: SendVolumeSideMetricRow }) {
  return (
    <Box className="email-send-volume-bottom-metric flex min-w-0 flex-1 items-center justify-center gap-2 px-2 sm:px-3">
      <Typography component="span" className="email-send-volume-side-label">
        {row.label}
      </Typography>
      <Typography component="span" className="email-send-volume-side-value">
        {row.value}
      </Typography>
      {row.deltaLabel ? (
        <Typography component="span" className="email-send-volume-delta">
          {row.deltaLabel}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function EmailDashboardPerformancePanel({
  performance,
}: EmailDashboardPerformancePanelProps) {
  const panel = performance.sendVolumePanel;
  const hasChart = performance.deliveryTrendPoints.length > 0;

  return (
    <Box className="email-send-volume-hero rounded-2xl p-4 md:p-5 lg:p-6">
      <Stack direction="row" spacing={0.75} className="mb-3 items-center">
        <Box className="email-send-volume-live-dot h-1.5 w-1.5 shrink-0 rounded-full" />
        <Typography component="p" className="email-send-volume-eyebrow">
          Delivery trend · Live · {performance.sendVolumeChipLabel}
        </Typography>
      </Stack>

      {performance.chartLoading ? (
        <Skeleton height={280} className="email-send-volume-skeleton rounded-xl" />
      ) : hasChart ? (
        <CampaignTimelineChart
          points={performance.deliveryTrendPoints}
          totalContacts={performance.trendAxisReference}
          variant="embedded"
          height={280}
        />
      ) : (
        <Box className="email-send-volume-chart-empty flex min-h-[280px] flex-col items-center justify-center rounded-xl px-4 text-center">
          <Typography variant="body2" className="email-send-volume-subtext max-w-sm">
            Send volume trends will appear once campaigns have sending activity in the
            last 12 months.
          </Typography>
        </Box>
      )}

      <Box className="email-send-volume-metrics-bottom mt-4 w-full border-t border-[rgba(148,163,184,0.2)] pt-4">
        {performance.isLoading ? (
          <Skeleton height={22} width="100%" className="email-send-volume-skeleton" />
        ) : (
          <Box className="email-send-volume-metrics-row grid w-full grid-cols-2 sm:grid-cols-4">
            {panel.sideMetrics.map((row) => (
              <SendVolumeBottomMetric key={row.label} row={row} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

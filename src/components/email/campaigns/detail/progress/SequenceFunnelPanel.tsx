'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SequenceFunnelChart, {
  type SequenceFunnelRow,
} from '@/components/email/campaigns/detail/progress/SequenceFunnelChart';
import type {
  EmailCampaignProgressFunnelStep,
  EmailCampaignProgressTimeline,
} from '@/lib/email/campaigns/progress-types';

interface SequenceFunnelPanelProps {
  timeline: EmailCampaignProgressTimeline;
  steps: EmailCampaignProgressFunnelStep[];
}

function buildFunnelRows(
  timeline: EmailCampaignProgressTimeline,
  steps: EmailCampaignProgressFunnelStep[],
): SequenceFunnelRow[] {
  return [
    {
      key: 'total',
      label: 'Total Contacts',
      count: timeline.totalContacts,
      percent: timeline.totalContacts > 0 ? 100 : 0,
    },
    ...steps.map((step) => ({
      key: `step-${step.stepOrder}`,
      label: step.label,
      count: step.count,
      percent: step.percent,
    })),
  ];
}

export default function SequenceFunnelPanel({
  timeline,
  steps,
}: SequenceFunnelPanelProps) {
  const rows = buildFunnelRows(timeline, steps);
  const isEmpty = timeline.totalContacts === 0 || steps.length === 0;

  return (
    <Box className="dashboard-panel flex h-full min-h-[240px] w-full flex-col rounded-2xl p-4 md:p-6">
      <Typography variant="subtitle2" className="mb-1 shrink-0 font-bold">
        Sequence Funnel
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mb-3 shrink-0">
        How contacts move through each sequence step
      </Typography>

      {isEmpty ? (
        <Box className="flex flex-1 flex-col items-center justify-center text-center">
          <Typography variant="subtitle2" className="font-bold">
            No funnel data yet
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-1 max-w-sm">
            Sequence step progression will appear here once sending begins.
          </Typography>
        </Box>
      ) : (
        <Box className="flex flex-1 flex-col justify-center">
          <SequenceFunnelChart rows={rows} />
        </Box>
      )}
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EngagementFunnelChart from '@/components/email/campaigns/detail/progress/EngagementFunnelChart';
import { buildEngagementFunnelSteps } from '@/lib/email/campaigns/engagement-funnel-utils';
import type { EmailCampaignProgressEngagement } from '@/lib/email/campaigns/progress-types';

interface EngagementFunnelPanelProps {
  engagement: EmailCampaignProgressEngagement;
}

export default function EngagementFunnelPanel({
  engagement,
}: EngagementFunnelPanelProps) {
  const steps = buildEngagementFunnelSteps(engagement);
  const hasData = engagement.sent > 0;

  return (
    <Box className="dashboard-panel flex h-full min-h-[420px] w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="mb-1 shrink-0 font-bold">
        Engagement funnel
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mb-4 shrink-0">
        Same metrics as the summary cards above, in funnel order
      </Typography>

      {hasData ? (
        <Box className="flex flex-1 flex-col justify-center">
          <EngagementFunnelChart steps={steps} />
        </Box>
      ) : (
        <Box className="flex flex-1 flex-col items-center justify-center text-center">
          <Typography variant="caption" color="text.secondary" className="max-w-sm">
            Engagement funnel data will appear once emails are sent.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

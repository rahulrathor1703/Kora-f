'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReplyBreakdownPieChart from '@/components/email/campaigns/detail/progress/ReplyBreakdownPieChart';
import type { EmailCampaignProgressReplyBreakdown } from '@/lib/email/campaigns/progress-types';

interface ReplyBreakdownPanelProps {
  items: EmailCampaignProgressReplyBreakdown[];
}

export default function ReplyBreakdownPanel({ items }: ReplyBreakdownPanelProps) {
  const hasData = items.some((item) => item.count > 0);

  return (
    <Box className="dashboard-panel flex h-full min-h-[280px] w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="mb-1 shrink-0 font-bold">
        Reply breakdown
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mb-4 shrink-0">
        How recipients responded, by reply category
      </Typography>

      {hasData ? (
        <Box className="flex flex-1 flex-col justify-center">
          <ReplyBreakdownPieChart items={items} />
        </Box>
      ) : (
        <Box className="flex flex-1 flex-col items-center justify-center text-center">
          <Typography variant="caption" color="text.secondary" className="max-w-sm">
            Reply categories will appear here once recipients respond.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

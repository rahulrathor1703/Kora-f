'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ContactStatusBarChart from '@/components/email/campaigns/detail/ContactStatusBarChart';
import type { EmailCampaignProgressRecipientStatus } from '@/lib/email/campaigns/recipient-types';

interface CampaignStatusBreakdownPanelProps {
  items: EmailCampaignProgressRecipientStatus[];
  isLoading: boolean;
}

export default function CampaignStatusBreakdownPanel({
  items,
  isLoading,
}: CampaignStatusBreakdownPanelProps) {
  if (isLoading) {
    return (
      <Box className="dashboard-panel flex h-full w-full min-h-[240px] items-center justify-center rounded-2xl p-5">
        <Typography variant="caption" color="text.secondary">
          Loading contact status…
        </Typography>
      </Box>
    );
  }

  const hasData = items.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <Box className="dashboard-panel flex h-full w-full min-h-[240px] flex-col items-center justify-center rounded-2xl p-5 text-center">
        <Typography variant="subtitle2" className="font-bold">
          Contact status breakdown
        </Typography>
        <Typography variant="caption" color="text.secondary" className="mt-1 max-w-sm">
          Recipient-level status will appear here once sending begins.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard-panel flex h-full w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="shrink-0 font-bold">
        Contact status breakdown
      </Typography>

      <Box className="mt-5 flex flex-1 flex-col">
        <ContactStatusBarChart items={items} />
      </Box>
    </Box>
  );
}

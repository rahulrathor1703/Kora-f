'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import CampaignStatusLinearChart from '@/components/email/campaigns/detail/progress/CampaignStatusLinearChart';
import type { EmailCampaignProgressDisposition } from '@/lib/email/campaigns/progress-types';

const CAMPAIGN_STATUS_ORDER = ['paused', 'stopped', 'excluded', 'done'] as const;

const CAMPAIGN_STATUS_LABELS: Record<
  (typeof CAMPAIGN_STATUS_ORDER)[number],
  string
> = {
  paused: 'Pause',
  stopped: 'Stop',
  excluded: 'Excluded',
  done: 'Done',
};

function buildCampaignStatusItems(
  items: EmailCampaignProgressDisposition[],
): EmailCampaignProgressDisposition[] {
  return CAMPAIGN_STATUS_ORDER.flatMap((disposition) => {
    const item = items.find((entry) => entry.disposition === disposition);

    if (!item) {
      return [];
    }

    return [
      {
        ...item,
        label: CAMPAIGN_STATUS_LABELS[disposition],
      },
    ];
  });
}

interface DispositionSummaryPanelProps {
  items: EmailCampaignProgressDisposition[];
}

export default function DispositionSummaryPanel({
  items,
}: DispositionSummaryPanelProps) {
  const statusItems = useMemo(() => buildCampaignStatusItems(items), [items]);
  const hasData = statusItems.some((item) => item.count > 0);

  return (
    <Box className="dashboard-panel flex h-full w-full flex-col rounded-2xl p-4 md:p-5">
      <Typography variant="subtitle2" className="shrink-0 font-bold">
        Campaign Status
      </Typography>

      {hasData ? (
        <Box className="mt-5 flex flex-1 flex-col">
          <CampaignStatusLinearChart items={statusItems} />
        </Box>
      ) : (
        <Box className="mt-5 flex flex-1 flex-col items-center justify-center text-center">
          <Typography variant="caption" color="text.secondary">
            Campaign disposition data will appear here once contacts are assigned.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

'use client';

import { useDroppable } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CampaignPipelineCard from '@/components/email/campaigns/pipeline/CampaignPipelineCard';
import type { ResolvedColumn } from '@/components/data-table/types';
import {
  CAMPAIGN_PIPELINE_COLORS,
  getCampaignColumnId,
  getCampaignPipelineStageLabel,
} from '@/lib/email/campaigns/pipeline-config';
import { isCampaignStatusDraggable } from '@/lib/email/campaigns/status-transitions';
import { withAlpha } from '@/lib/crm/pipeline/stage-color';
import type { EmailCampaign, EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface CampaignPipelineColumnProps {
  status: EmailCampaignStatus;
  count: number;
  campaigns: EmailCampaign[];
  cardColumns: ResolvedColumn<EmailCampaign>[];
  canDrag: boolean;
  optimisticIncoming: EmailCampaign[];
  optimisticOutgoingIds: ReadonlySet<string>;
  onOpenCampaign?: (campaign: EmailCampaign) => void;
}

export default function CampaignPipelineColumn({
  status,
  count,
  campaigns,
  cardColumns,
  canDrag,
  optimisticIncoming,
  optimisticOutgoingIds,
  onOpenCampaign,
}: CampaignPipelineColumnProps) {
  const columnId = getCampaignColumnId(status);
  const stageColor = CAMPAIGN_PIPELINE_COLORS[status];

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { status },
  });

  const displayCampaigns = [
    ...optimisticIncoming,
    ...campaigns.filter((campaign) => !optimisticOutgoingIds.has(campaign.id)),
  ];

  return (
    <Box
      ref={setNodeRef}
      className="flex h-full w-[18.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition-[border-color,box-shadow] duration-200"
      sx={{
        borderColor: isOver ? stageColor : withAlpha(stageColor, 0.22),
        boxShadow: isOver
          ? `0 0 0 2px ${withAlpha(stageColor, 0.25)}, 0 12px 32px ${withAlpha(stageColor, 0.12)}`
          : `0 1px 2px ${withAlpha(stageColor, 0.08)}`,
        bgcolor: withAlpha(stageColor, 0.04),
      }}
    >
      <Stack
        spacing={0}
        className="border-b"
        sx={{
          borderColor: withAlpha(stageColor, 0.16),
          bgcolor: withAlpha(stageColor, 0.08),
        }}
      >
        <Box className="h-1 w-full" sx={{ bgcolor: stageColor }} aria-hidden />
        <Stack
          direction="row"
          spacing={1}
          className="px-3 py-3"
          sx={{ alignItems: 'center' }}
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
            style={{ backgroundColor: stageColor }}
          />
          <Typography variant="subtitle2" className="min-w-0 flex-1 font-semibold">
            {getCampaignPipelineStageLabel(status)}
          </Typography>
          <Chip
            label={count}
            size="small"
            className="h-6 min-w-8 font-semibold"
            sx={{
              bgcolor: withAlpha(stageColor, 0.14),
              color: stageColor,
              border: `1px solid ${withAlpha(stageColor, 0.28)}`,
            }}
          />
        </Stack>
      </Stack>

      <Box className="flex-1 overflow-y-auto px-2 py-3">
        <Stack spacing={1.5}>
          {displayCampaigns.length === 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
              className="block px-2 py-6 text-center"
            >
              No campaigns
            </Typography>
          ) : (
            displayCampaigns.map((campaign) => (
              <CampaignPipelineCard
                key={campaign.id}
                campaign={campaign}
                status={status}
                cardColumns={cardColumns}
                draggable={isCampaignStatusDraggable(campaign.status, canDrag)}
                onOpen={onOpenCampaign}
              />
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}

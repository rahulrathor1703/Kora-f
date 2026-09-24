'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatCellValue } from '@/components/data-table/formatCellValue';
import type { ResolvedColumn } from '@/components/data-table/types';
import {
  CAMPAIGN_PIPELINE_COLORS,
} from '@/lib/email/campaigns/pipeline-config';
import { withAlpha } from '@/lib/crm/pipeline/stage-color';
import type { EmailCampaign, EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface CampaignPipelineCardProps {
  campaign: EmailCampaign;
  status: EmailCampaignStatus;
  cardColumns: ResolvedColumn<EmailCampaign>[];
  draggable: boolean;
  onOpen?: (campaign: EmailCampaign) => void;
}

function renderCardField(
  campaign: EmailCampaign,
  column: ResolvedColumn<EmailCampaign>,
) {
  if (column.render) {
    return column.render(campaign);
  }

  const value = formatCellValue(
    (campaign as unknown as Record<string, unknown>)[column.field],
  );

  return (
    <Typography variant="caption" color="text.secondary" className="block">
      {column.label}: {value}
    </Typography>
  );
}

export default function CampaignPipelineCard({
  campaign,
  status,
  cardColumns,
  draggable,
  onOpen,
}: CampaignPipelineCardProps) {
  const accentColor = CAMPAIGN_PIPELINE_COLORS[status];

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: campaign.id,
      disabled: !draggable,
      data: {
        status,
        campaign,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      className={`group relative overflow-hidden rounded-xl bg-surface transition-[border-color,box-shadow,transform] duration-150 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'scale-[0.98]' : ''}`}
      sx={{
        border: '1px solid',
        borderColor: withAlpha(accentColor, 0.18),
        pl: 0,
        ...(draggable
          ? {
              '@media (prefers-reduced-motion: no-preference)': {
                '&:hover': {
                  borderColor: accentColor,
                  boxShadow: `0 8px 24px ${withAlpha(accentColor, 0.22)}`,
                  transform: 'translateY(-1px)',
                },
              },
              '@media (prefers-reduced-motion: reduce)': {
                '&:hover': {
                  borderColor: accentColor,
                },
              },
            }
          : {}),
      }}
      {...(draggable ? { ...listeners, ...attributes } : {})}
      onClick={() => {
        if (!isDragging) {
          onOpen?.(campaign);
        }
      }}
    >
      <Box
        aria-hidden
        className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full"
        sx={{ bgcolor: accentColor }}
      />

      <Box className="px-3.5 py-3 pl-4">
        <Typography variant="body2" className="font-semibold leading-snug">
          {campaign.name}
        </Typography>

        {cardColumns.length > 0 ? (
          <Stack spacing={0.75} className="mt-2">
            {cardColumns.map((column) => (
              <Box key={column.field}>{renderCardField(campaign, column)}</Box>
            ))}
          </Stack>
        ) : null}
      </Box>
    </Paper>
  );
}

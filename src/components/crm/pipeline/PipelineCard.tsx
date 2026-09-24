'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  DEFAULT_STAGE_COLOR,
  normalizeStageColor,
  withAlpha,
} from '@/lib/crm/pipeline/stage-color';
import { resolveProductLabels } from '@/lib/crm/prospects/product-labels';
import type { Prospect, ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface PipelineCardProps {
  prospect: Prospect;
  stageValue: string;
  stageColor?: string;
  productField?: ProspectFieldDefinition;
  draggable: boolean;
  onOpen?: (prospect: Prospect) => void;
}

function resolveProductLabel(
  productField: ProspectFieldDefinition | undefined,
  prospect: Prospect,
): string {
  return resolveProductLabels(
    productField,
    prospect.values.product,
    prospect.email || 'No company',
  );
}

export default function PipelineCard({
  prospect,
  stageValue,
  stageColor,
  productField,
  draggable,
  onOpen,
}: PipelineCardProps) {
  const accentColor =
    normalizeStageColor(stageColor ?? '') ?? DEFAULT_STAGE_COLOR;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: prospect.id,
      disabled: !draggable,
      data: {
        stage: stageValue,
        prospect,
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
          onOpen?.(prospect);
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
          {prospect.fullName || 'Unnamed prospect'}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          className="mt-1 block truncate"
        >
          {resolveProductLabel(productField, prospect)}
        </Typography>
      </Box>
    </Paper>
  );
}

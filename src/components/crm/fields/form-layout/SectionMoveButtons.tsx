'use client';

import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { LayoutSectionMoveDirection } from '@/lib/crm/fields/section-field.utils';

interface SectionMoveButtonsProps {
  sectionTitle: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: LayoutSectionMoveDirection) => void;
}

export default function SectionMoveButtons({
  sectionTitle,
  canMoveUp,
  canMoveDown,
  onMove,
}: SectionMoveButtonsProps) {
  return (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
      <Tooltip title="Move section up" placement="top">
        <span className="inline-flex">
          <IconButton
            size="small"
            aria-label={`Move ${sectionTitle} section up`}
            disabled={!canMoveUp}
            className="text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-40"
            onClick={() => onMove('up')}
          >
            <ArrowUpwardOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Move section down" placement="top">
        <span className="inline-flex">
          <IconButton
            size="small"
            aria-label={`Move ${sectionTitle} section down`}
            disabled={!canMoveDown}
            className="text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-40"
            onClick={() => onMove('down')}
          >
            <ArrowDownwardOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

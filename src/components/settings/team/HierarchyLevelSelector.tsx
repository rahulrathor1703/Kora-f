'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

interface HierarchyLevelSelectorProps {
  value: number;
  onChange: (level: number) => void;
  disabled?: boolean;
}

const LEVELS = Array.from({ length: 10 }, (_, index) => index + 1);

function getLevelTooltip(level: number): string {
  if (level === 1) {
    return 'Level 1 — top of org';
  }

  if (level === 10) {
    return 'Level 10 — entry level';
  }

  return `Level ${level}`;
}

export default function HierarchyLevelSelector({
  value,
  onChange,
  disabled = false,
}: HierarchyLevelSelectorProps) {
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="body2" className="font-semibold">
          Hierarchy level
        </Typography>
        <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
          Level 1 is the top of your org; higher levels are progressively more entry-level (Level 10 is entry level).
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.75} className="flex-wrap gap-y-2">
        {LEVELS.map((level) => {
          const selected = value === level;

          return (
            <Tooltip key={level} title={getLevelTooltip(level)} arrow>
              <Chip
                label={`L${level}`}
                clickable={!disabled}
                color={selected ? 'primary' : 'default'}
                onClick={() => {
                  if (!disabled) {
                    onChange(level);
                  }
                }}
                className={`rounded-xl font-semibold transition-all ${
                  selected
                    ? 'shadow-primary-soft'
                    : 'border-slate-200/70 bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/70'
                }`}
                variant={selected ? 'filled' : 'outlined'}
                disabled={disabled}
              />
            </Tooltip>
          );
        })}
      </Stack>
    </Stack>
  );
}

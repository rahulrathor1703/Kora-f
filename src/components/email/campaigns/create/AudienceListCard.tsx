'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AudienceListType } from '@/lib/email/campaigns/types';

interface AudienceListCardProps {
  id: string;
  type: AudienceListType;
  name: string;
  contextLabel: string;
  count: number;
  countLabel: string;
  selected: boolean;
  onSelect: (type: AudienceListType, id: string) => void;
}

export default function AudienceListCard({
  id,
  type,
  name,
  contextLabel,
  count,
  countLabel,
  selected,
  onSelect,
}: AudienceListCardProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(type, id)}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected
          ? 'border-primary bg-primary-soft/40'
          : 'border-surface-border bg-surface hover:border-primary/40'
      }`}
    >
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle1" className="font-bold">
            {name}
          </Typography>
          {selected ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="Selected"
              size="small"
              color="primary"
              variant="outlined"
              className="rounded-lg"
            />
          ) : null}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {contextLabel}
        </Typography>
      </Stack>

      <Stack spacing={0.25} sx={{ alignItems: 'flex-end', minWidth: 72 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Typography variant="h5" className="font-bold leading-none">
            {count.toLocaleString()}
          </Typography>
          <LinkIcon fontSize="small" className="text-text-secondary" />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {countLabel}
        </Typography>
      </Stack>
    </Box>
  );
}

'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {
  FOLLOW_UP_RANGE_LABELS,
  FOLLOW_UP_RANGES,
  type FollowUpRange,
} from '@/lib/crm/followups/types';

interface FollowupsToolbarProps {
  activeRange: FollowUpRange;
  onRangeChange: (range: FollowUpRange) => void;
}

export default function FollowupsToolbar({
  activeRange,
  onRangeChange,
}: FollowupsToolbarProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      className="mb-4 flex-wrap gap-y-2"
    >
      {FOLLOW_UP_RANGES.map((range) => {
        const isActive = range === activeRange;

        return (
          <Button
            key={range}
            size="small"
            variant={isActive ? 'contained' : 'outlined'}
            onClick={() => onRangeChange(range)}
            className="rounded-full px-4 normal-case"
            sx={
              isActive
                ? {
                    bgcolor: '#3b82f6',
                    '&:hover': { bgcolor: '#2563eb' },
                  }
                : {
                    borderColor: 'divider',
                    color: 'text.secondary',
                  }
            }
          >
            {FOLLOW_UP_RANGE_LABELS[range]}
          </Button>
        );
      })}
    </Stack>
  );
}

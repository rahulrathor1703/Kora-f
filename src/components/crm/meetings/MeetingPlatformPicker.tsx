'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  MEETING_PLATFORMS_ORDER,
  MEETING_PLATFORM_CONFIG,
} from '@/lib/crm/meetings/platform-config';
import type { MeetingPlatform } from '@/lib/crm/meetings/types';

interface MeetingPlatformPickerProps {
  value: MeetingPlatform | null;
  disabled?: boolean;
  onChange: (platform: MeetingPlatform) => void;
}

export default function MeetingPlatformPicker({
  value,
  disabled = false,
  onChange,
}: MeetingPlatformPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {MEETING_PLATFORMS_ORDER.map((platform) => {
        const config = MEETING_PLATFORM_CONFIG[platform];
        const Icon = config.icon;
        const isSelected = value === platform;

        return (
          <Button
            key={platform}
            variant={isSelected ? 'contained' : 'outlined'}
            onClick={() => onChange(platform)}
            disabled={disabled}
            className="h-auto justify-start rounded-xl px-4 py-3 normal-case"
            sx={
              isSelected
                ? {
                    bgcolor: '#4338CA',
                    '&:hover': { bgcolor: '#3730A3' },
                  }
                : undefined
            }
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Icon fontSize="small" />
              <Stack spacing={0.25} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" className="font-semibold">
                  {config.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: isSelected ? 'inherit' : 'text.secondary' }}
                >
                  {config.description}
                </Typography>
              </Stack>
            </Stack>
          </Button>
        );
      })}
    </div>
  );
}

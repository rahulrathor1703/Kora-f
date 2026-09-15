'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  formatMinutesAsTime,
  formatSendingWindowDuration,
} from '@/lib/email/campaigns/schedule-utils';

interface SendingWindowTimelineProps {
  startMinutes: number;
  endMinutes: number;
}

const MARKERS = [
  { label: '12 AM', minutes: 0 },
  { label: '6 AM', minutes: 6 * 60 },
  { label: '12 PM', minutes: 12 * 60 },
  { label: '6 PM', minutes: 18 * 60 },
  { label: '12 AM', minutes: 24 * 60 },
];

export default function SendingWindowTimeline({
  startMinutes,
  endMinutes,
}: SendingWindowTimelineProps) {
  const startPercent = (startMinutes / (24 * 60)) * 100;
  const widthPercent = ((endMinutes - startMinutes) / (24 * 60)) * 100;

  return (
    <Box>
      <Box className="relative h-3 overflow-hidden rounded-full bg-surface-muted">
        <Box
          className="absolute inset-y-0 rounded-full bg-primary"
          sx={{
            left: `${startPercent}%`,
            width: `${Math.max(widthPercent, 1)}%`,
          }}
        />
      </Box>

      <Box className="mt-2 flex justify-between">
        {MARKERS.map((marker) => (
          <Typography
            key={`${marker.label}-${marker.minutes}`}
            variant="caption"
            color="text.secondary"
          >
            {marker.label}
          </Typography>
        ))}
      </Box>

      <Typography variant="body2" color="primary" className="mt-2 font-medium">
        {formatSendingWindowDuration(startMinutes, endMinutes)}
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mt-1 block">
        Sends begin at {formatMinutesAsTime(startMinutes)} on the launch date
        and each batch day.
      </Typography>
    </Box>
  );
}

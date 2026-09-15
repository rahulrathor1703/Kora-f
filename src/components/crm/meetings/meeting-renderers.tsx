import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getMeetingPlatformConfig } from '@/lib/crm/meetings/platform-config';
import {
  MEETING_STATUS_COLORS,
  MEETING_STATUS_LABELS,
} from '@/lib/crm/meetings/status-config';
import type { MeetingPlatform, MeetingStatus } from '@/lib/crm/meetings/types';

export function formatMeetingDateTime(value: string | null): string {
  if (!value) {
    return 'Not scheduled';
  }

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatMeetingDate(value: string | null): string {
  if (!value) {
    return 'Not scheduled';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMeetingCreatedAt(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function renderMeetingPlatformChip(platform: MeetingPlatform | string) {
  const config = getMeetingPlatformConfig(platform);
  const Icon = config.icon;

  return (
    <Chip
      size="small"
      icon={<Icon fontSize="small" />}
      label={config.label}
      variant="outlined"
      className="font-medium"
    />
  );
}

export function renderMeetingStatusChip(status: MeetingStatus) {
  return (
    <Chip
      size="small"
      label={MEETING_STATUS_LABELS[status]}
      color={MEETING_STATUS_COLORS[status]}
      variant={status === 'scheduled' ? 'outlined' : 'filled'}
      className="font-medium"
    />
  );
}

export function renderMeetingProspectCell(
  name: string,
  email: string,
  subtitle?: string,
) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2" className="font-semibold">
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle ? `${subtitle} · ${email}` : email}
      </Typography>
    </Stack>
  );
}

export function buildProspectSubtitle(
  designation?: string,
  product?: string,
): string | undefined {
  if (designation && product) {
    return `${designation} · ${product}`;
  }

  return designation ?? product;
}

'use client';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';
import { MEETING_PLATFORM_CONFIG } from '@/lib/crm/meetings/platform-config';
import { startCalendarConnectionOAuth } from '@/lib/crm/meetings/calendar-oauth';
import type {
  CalendarConnection,
  CalendarConnectionAvailability,
  CalendarConnectionProvider,
  MeetingPlatform,
} from '@/lib/crm/meetings/types';
import { getOrgSlugFromPathname } from '@/lib/org-path';

interface CalendarConnectionBannerProps {
  platform: MeetingPlatform | null;
  connections: CalendarConnection[];
  availability?: CalendarConnectionAvailability;
  isDisconnecting?: boolean;
  onDisconnect: (provider: CalendarConnectionProvider) => Promise<void>;
}

export default function CalendarConnectionBanner({
  platform,
  connections,
  availability,
  isDisconnecting = false,
  onDisconnect,
}: CalendarConnectionBannerProps) {
  const pathname = usePathname();
  const orgSlug = getOrgSlugFromPathname(pathname);

  if (!platform) {
    return (
      <Typography variant="body2" color="text.secondary">
        Choose a platform to connect your calendar account.
      </Typography>
    );
  }

  const connection = connections.find((item) => item.provider === platform);
  const config = MEETING_PLATFORM_CONFIG[platform];
  const isAvailable = availability?.[platform] ?? true;

  if (connection) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip
          size="small"
          icon={<CheckCircleOutlineOutlinedIcon />}
          label={`${config.label}: ${connection.email}`}
          color="success"
          variant="outlined"
        />
        <Button
          size="small"
          color="inherit"
          startIcon={<LinkOffOutlinedIcon fontSize="small" />}
          disabled={isDisconnecting}
          onClick={() => void onDisconnect(platform)}
        >
          Disconnect
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        Connect your {config.label} account to schedule meetings and send invites.
      </Typography>
      <Button
        variant="outlined"
        size="small"
        className="self-start"
        disabled={!orgSlug || !isAvailable}
        onClick={() => {
          if (!orgSlug) {
            return;
          }

          startCalendarConnectionOAuth(platform, orgSlug);
        }}
      >
        Connect {config.label}
      </Button>
      {!isAvailable ? (
        <Typography variant="caption" color="warning.main">
          {config.label} OAuth is not configured on the server yet.
        </Typography>
      ) : null}
    </Stack>
  );
}

interface CalendarConnectionStatusBarProps {
  connections: CalendarConnection[];
  availability?: CalendarConnectionAvailability;
}

export function CalendarConnectionStatusBar({
  connections,
  availability,
}: CalendarConnectionStatusBarProps) {
  const pathname = usePathname();
  const orgSlug = getOrgSlugFromPathname(pathname);

  return (
    <Stack direction="row" spacing={1} className="flex-wrap gap-y-1">
      {(['google', 'outlook', 'zoom'] as const).map((provider) => {
        const connection = connections.find((item) => item.provider === provider);
        const config = MEETING_PLATFORM_CONFIG[provider];
        const isAvailable = availability?.[provider] ?? true;

        if (connection) {
          return (
            <Chip
              key={provider}
              size="small"
              icon={<CheckCircleOutlineOutlinedIcon />}
              label={`${config.label}: ${connection.email}`}
              color="success"
              variant="outlined"
            />
          );
        }

        return (
          <Button
            key={provider}
            size="small"
            variant="outlined"
            disabled={!orgSlug || !isAvailable}
            onClick={() => {
              if (!orgSlug) {
                return;
              }

              startCalendarConnectionOAuth(provider, orgSlug);
            }}
          >
            Connect {config.label}
          </Button>
        );
      })}
    </Stack>
  );
}

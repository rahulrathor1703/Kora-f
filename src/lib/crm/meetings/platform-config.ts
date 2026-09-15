import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { MeetingPlatform } from '@/lib/crm/meetings/types';

export interface MeetingPlatformConfig {
  value: MeetingPlatform;
  label: string;
  description: string;
  icon: SvgIconComponent;
}

export const MEETING_PLATFORM_CONFIG: Record<
  MeetingPlatform,
  MeetingPlatformConfig
> = {
  google: {
    value: 'google',
    label: 'Google Meet',
    description: 'Schedule via Google Calendar',
    icon: VideoCameraFrontOutlinedIcon,
  },
  outlook: {
    value: 'outlook',
    label: 'Outlook',
    description: 'Schedule via Microsoft Calendar',
    icon: EventOutlinedIcon,
  },
  zoom: {
    value: 'zoom',
    label: 'Zoom',
    description: 'Online video meeting',
    icon: VideocamOutlinedIcon,
  },
};

export const MEETING_PLATFORMS_ORDER: MeetingPlatform[] = [
  'google',
  'outlook',
  'zoom',
];

const LEGACY_PLATFORM_ALIASES: Record<string, MeetingPlatform> = {
  gmail: 'google',
};

const FALLBACK_PLATFORM_CONFIG: MeetingPlatformConfig = {
  value: 'google',
  label: 'Unknown platform',
  description: 'Legacy or unsupported meeting platform',
  icon: EventOutlinedIcon,
};

export function getMeetingPlatformConfig(
  platform: string,
): MeetingPlatformConfig {
  const normalized =
    LEGACY_PLATFORM_ALIASES[platform] ??
    (MEETING_PLATFORMS_ORDER.includes(platform as MeetingPlatform)
      ? (platform as MeetingPlatform)
      : null);

  if (normalized) {
    return MEETING_PLATFORM_CONFIG[normalized];
  }

  if (platform === 'physical') {
    return {
      value: 'google',
      label: 'In-person',
      description: 'Legacy in-person meeting',
      icon: EventOutlinedIcon,
    };
  }

  return {
    ...FALLBACK_PLATFORM_CONFIG,
    label: platform.trim() || FALLBACK_PLATFORM_CONFIG.label,
  };
}

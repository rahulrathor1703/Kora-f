'use client';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import Link from 'next/link';
import { useSettingsHref } from '@/hooks/useSettingsHref';

export interface SettingsHubCardProps {
  href: string;
  label: string;
  description: string;
  icon: SvgIconComponent;
  badge?: string;
  showNotificationDot?: boolean;
}

export default function SettingsHubCard({
  href,
  label,
  description,
  icon: Icon,
  badge,
  showNotificationDot = false,
}: SettingsHubCardProps) {
  const resolvedHref = useSettingsHref(href);

  return (
    <Link
      href={resolvedHref}
      aria-label={`${label}: ${description}`}
      className="group/hub block h-full rounded-2xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Box className="settings-hub-card surface-panel flex h-full flex-col rounded-2xl p-5 md:p-6">
        <Stack spacing={2.5} className="flex-1">
          <Box className="flex items-start justify-between gap-3">
            <Box className="settings-hub-card-icon relative">
              <Icon sx={{ fontSize: 22 }} aria-hidden />
              {showNotificationDot ? (
                <Box
                  className="absolute right-0 top-0 h-2 w-2 rounded-full bg-error-main ring-2 ring-surface"
                  aria-hidden
                />
              ) : null}
            </Box>
            <ChevronRightOutlinedIcon
              aria-hidden
              className="shrink-0 text-primary opacity-0 transition-all duration-200 group-hover/hub:translate-x-0.5 group-hover/hub:opacity-100"
              sx={{ fontSize: 20 }}
            />
          </Box>

          <Box className="min-w-0">
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                variant="subtitle1"
                component="h3"
                className="font-semibold text-foreground transition-colors duration-200 group-hover/hub:text-primary"
              >
                {label}
              </Typography>
              {badge ? (
                <Chip
                  label={badge}
                  size="small"
                  color="warning"
                  variant="outlined"
                  className="h-6 font-medium"
                />
              ) : null}
            </Stack>
            <Typography variant="body2" className="mt-1.5 line-clamp-2 text-pretty text-muted">
              {description}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Link>
  );
}

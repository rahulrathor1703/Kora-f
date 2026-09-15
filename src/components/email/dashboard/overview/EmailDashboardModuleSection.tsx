'use client';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { EmailDashboardModuleSnapshot } from '@/hooks/useEmailDashboardSummary';

interface EmailDashboardModuleSectionProps {
  snapshot: EmailDashboardModuleSnapshot;
  isLoading?: boolean;
}

export default function EmailDashboardModuleSection({
  snapshot,
  isLoading = false,
}: EmailDashboardModuleSectionProps) {
  const Icon = snapshot.icon;

  return (
    <Link
      href={snapshot.href}
      aria-label={`${snapshot.title}: ${snapshot.description}`}
      className="group/module block h-full rounded-2xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Box className="dashboard-panel flex h-full flex-col rounded-2xl p-4 md:p-5">
        <Stack spacing={2.5} className="flex-1">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box className="settings-hub-card-icon relative shrink-0">
              <Icon sx={{ fontSize: 22 }} aria-hidden />
              {snapshot.showNotificationDot ? (
                <Box
                  className="absolute right-0 top-0 h-2 w-2 rounded-full bg-error-main ring-2 ring-surface"
                  aria-hidden
                />
              ) : null}
            </Box>
            <Box className="min-w-0 flex-1">
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography
                  variant="subtitle1"
                  component="h3"
                  className="font-semibold text-foreground transition-colors duration-200 group-hover/module:text-primary"
                >
                  {snapshot.title}
                </Typography>
                {snapshot.badge ? (
                  <Chip
                    label={snapshot.badge}
                    size="small"
                    color="warning"
                    variant="outlined"
                    className="h-6 font-medium"
                  />
                ) : null}
              </Stack>
              <Typography variant="body2" className="mt-1 line-clamp-2 text-pretty text-muted">
                {snapshot.description}
              </Typography>
            </Box>
            <ChevronRightOutlinedIcon
              aria-hidden
              className="shrink-0 text-primary opacity-0 transition-all duration-200 group-hover/module:translate-x-0.5 group-hover/module:opacity-100"
              sx={{ fontSize: 20 }}
            />
          </Stack>

          <Box className="grid grid-cols-2 gap-3 border-t border-surface-border pt-3">
            {snapshot.metrics.map((metric) => (
              <Box key={metric.label} className="min-w-0">
                <Typography variant="caption" color="text.secondary" className="block text-xs">
                  {metric.label}
                </Typography>
                {isLoading ? (
                  <Skeleton width={48} height={28} className="mt-0.5" />
                ) : (
                  <Typography variant="h6" component="p" className="mt-0.5 font-bold tracking-tight">
                    {metric.value}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    </Link>
  );
}

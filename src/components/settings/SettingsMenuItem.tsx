'use client';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import Link from 'next/link';
import { useSettingsHref } from '@/hooks/useSettingsHref';

export interface SettingsMenuItemProps {
  href: string;
  label: string;
  description: string;
  icon: SvgIconComponent;
  showNotificationDot?: boolean;
  showDescription?: boolean;
  compact?: boolean;
}

export default function SettingsMenuItem({
  href,
  label,
  description,
  icon: Icon,
  showNotificationDot = false,
  showDescription = true,
  compact = false,
}: SettingsMenuItemProps) {
  const resolvedHref = useSettingsHref(href);

  return (
    <Link
      href={resolvedHref}
      aria-label={showDescription ? `${label}: ${description}` : label}
      className={`group/item flex no-underline backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/90 hover:shadow-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-slate-700/50 dark:bg-slate-900/20 dark:hover:border-primary/35 dark:hover:bg-slate-900/70 dark:hover:shadow-black/30 ${
        compact
          ? 'gap-2 rounded-xl border border-slate-200/50 bg-white/30 p-2.5'
          : 'gap-3 rounded-2xl border border-slate-200/50 bg-white/30 p-3.5'
      } ${showDescription ? 'items-start' : 'items-center'}`}
    >
      <Box
        aria-hidden
        className={`relative flex shrink-0 items-center justify-center bg-primary-soft text-primary shadow-sm transition-all duration-200 group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-white group-hover/item:shadow-md ${
          compact ? 'h-8 w-8 rounded-lg' : 'h-11 w-11 rounded-2xl'
        }`}
      >
        <Icon sx={{ fontSize: compact ? 16 : 20 }} />
        {showNotificationDot ? (
          <Box
            className={`absolute rounded-full bg-error-main ring-2 ring-white dark:ring-slate-900 ${
              compact ? 'right-0.5 top-0.5 h-1.5 w-1.5' : 'right-1 top-1 h-2 w-2'
            }`}
            aria-hidden
          />
        ) : null}
      </Box>

      <Box className="min-w-0 flex-1">
        <Typography
          variant={compact ? 'caption' : 'body2'}
          component="h3"
          className={`font-semibold transition-colors duration-200 group-hover/item:text-primary ${
            compact ? 'text-sm leading-tight' : ''
          }`}
        >
          {label}
        </Typography>
        {showDescription ? (
          <Typography
            variant="caption"
            color="text.secondary"
            className="mt-0.5 line-clamp-2 block leading-relaxed"
          >
            {description}
          </Typography>
        ) : null}
      </Box>

      <ChevronRightOutlinedIcon
        aria-hidden
        className={`shrink-0 text-primary opacity-0 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:opacity-100 ${
          compact ? '' : 'mt-0.5'
        }`}
        sx={{ fontSize: compact ? 16 : 18 }}
      />
    </Link>
  );
}

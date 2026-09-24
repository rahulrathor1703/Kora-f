'use client';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useSettingsHref } from '@/hooks/useSettingsHref';

interface SettingsNavButtonProps {
  href: string;
  label: string;
  align?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function SettingsNavButton({
  href,
  label,
  align = 'left',
  onClick,
}: SettingsNavButtonProps) {
  const isRight = align === 'right';
  const resolvedHref = useSettingsHref(href);

  return (
    <Link
      href={resolvedHref}
      onClick={onClick}
      className="settings-nav-button group inline-flex w-fit self-start items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 no-underline backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-primary-soft dark:border-slate-700/70 dark:bg-slate-900/50"
    >
      {!isRight ? (
        <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary/15">
          <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
      ) : null}

      <Typography
        variant="body2"
        component="span"
        className="font-semibold text-text-secondary transition-colors group-hover:text-primary"
      >
        {label}
      </Typography>

      {isRight ? (
        <>
          <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary/15">
            <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
        </>
      ) : null}
    </Link>
  );
}

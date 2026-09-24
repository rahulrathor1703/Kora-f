'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface PlatformPageHeaderProps {
  overline: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function PlatformPageHeader({
  overline,
  title,
  description,
  actions,
}: PlatformPageHeaderProps) {
  return (
    <Box className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <Box className="max-w-3xl">
        <Typography className="platform-overline">{overline}</Typography>
        <Typography variant="h4" component="h1" className="platform-title mt-2">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mt-2">
          {description}
        </Typography>
      </Box>
      {actions ? <Box className="shrink-0">{actions}</Box> : null}
    </Box>
  );
}

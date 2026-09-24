'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsSubPageNav, {
  type SettingsParentBackLink,
} from '@/components/settings/SettingsSubPageNav';

interface SettingsSubPageHeaderProps {
  overline: string;
  title: string;
  description?: string;
  titleAction?: ReactNode;
  parentBack?: SettingsParentBackLink;
  showPlatformBackLink?: boolean;
}

export default function SettingsSubPageHeader({
  overline,
  title,
  description,
  titleAction,
  parentBack,
  showPlatformBackLink = true,
}: SettingsSubPageHeaderProps) {
  return (
    <Box>
      <SettingsSubPageNav
        parentBack={parentBack}
        showPlatformBackLink={showPlatformBackLink}
        className="mb-3"
      />

      <Typography
        variant="overline"
        className="font-semibold tracking-[0.1em] text-primary"
      >
        {overline}
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        className="mt-2"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h4" component="h1" className="font-bold text-foreground">
          {title}
        </Typography>
        {titleAction ? <Box className="shrink-0">{titleAction}</Box> : null}
      </Stack>
      {description ? (
        <Typography variant="body1" color="text.secondary" className="mt-2 max-w-2xl">
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

export type { SettingsParentBackLink };

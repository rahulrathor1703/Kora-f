'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SettingsSubPageNav, {
  type SettingsParentBackLink,
} from '@/components/settings/SettingsSubPageNav';

interface SettingsSubPageHeaderProps {
  overline: string;
  title: string;
  description: string;
  parentBack?: SettingsParentBackLink;
  showPlatformBackLink?: boolean;
}

export default function SettingsSubPageHeader({
  overline,
  title,
  description,
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
      <Typography variant="h4" component="h1" className="mt-2 font-bold text-foreground">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" className="mt-2 max-w-2xl">
        {description}
      </Typography>
    </Box>
  );
}

export type { SettingsParentBackLink };

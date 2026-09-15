'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SettingsBackLink from '@/components/settings/SettingsBackLink';
import SettingsNavButton from '@/components/settings/SettingsNavButton';

export interface SettingsParentBackLink {
  href: string;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface SettingsSubPageNavProps {
  parentBack?: SettingsParentBackLink;
  className?: string;
  showPlatformBackLink?: boolean;
}

export default function SettingsSubPageNav({
  parentBack,
  className,
  showPlatformBackLink = true,
}: SettingsSubPageNavProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      className={className}
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      {parentBack ? (
        <SettingsNavButton
          href={parentBack.href}
          label={parentBack.label}
          align="left"
          onClick={parentBack.onClick}
        />
      ) : (
        <SettingsBackLink align="left" />
      )}

      {showPlatformBackLink ? (
        parentBack ? (
          <SettingsBackLink align="right" />
        ) : (
          <Box aria-hidden />
        )
      ) : (
        <Box aria-hidden />
      )}
    </Stack>
  );
}

'use client';

import SettingsNavButton from '@/components/settings/SettingsNavButton';

interface SettingsBackLinkProps {
  align?: 'left' | 'right';
}

export default function SettingsBackLink({
  align = 'left',
}: SettingsBackLinkProps) {
  return (
    <SettingsNavButton
      href="/settings"
      label="Back to settings"
      align={align}
    />
  );
}

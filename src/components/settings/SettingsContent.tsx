'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSession } from '@/hooks/useAuth';
import { hasPermission, isPlatformOwner } from '@/lib/api/types/auth.types';
import { settingsNavItems, settingsSections } from '@/lib/settings-navigation';
import SettingsSectionCard from '@/components/settings/SettingsSectionCard';

export default function SettingsContent() {
  const { data: session } = useSession();

  const visibleItems = settingsNavItems.filter((item) => {
    if (item.platformOwnerOnly && !isPlatformOwner(session)) {
      return false;
    }

    if (!item.requiredPermission) {
      return true;
    }

    return hasPermission(session, item.requiredPermission);
  });

  const visibleSections = settingsSections
    .map((section) => ({
      ...section,
      items: visibleItems.filter((item) => item.section === section.id),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Stack spacing={3}>
      <Box className="dashboard-hero surface-panel rounded-2xl p-6 md:p-8">
        <Box className="max-w-3xl">
          <Typography
            variant="overline"
            className="font-semibold tracking-[0.1em] text-primary"
          >
            Workspace
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            className="mt-2 text-3xl font-bold text-foreground md:text-4xl"
          >
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mt-3 max-w-2xl">
            Manage your workspace preferences, account, and access control.
          </Typography>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {visibleSections.map((section) => (
          <SettingsSectionCard
            key={section.id}
            title={section.title}
            description={section.description}
            items={section.items}
          />
        ))}
      </Box>
    </Stack>
  );
}

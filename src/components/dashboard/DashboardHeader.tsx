'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ColorModeToggle from '@/components/ColorModeToggle';
import NotificationBell from '@/components/dashboard/NotificationBell';
import ProfileMenu from '@/components/dashboard/ProfileMenu';
import { useImpersonation } from '@/contexts/impersonation';
import { useSession } from '@/hooks/useAuth';
import { env } from '@/config/env';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const { organization: impersonatedOrganization } = useImpersonation();
  const organizationName =
    impersonatedOrganization?.name ??
    session?.organization?.name ??
    session?.email ??
    env.brandName;

  return (
    <AppBar
      position="static"
      elevation={0}
      className="dashboard-header shrink-0"
      sx={{ bgcolor: 'transparent' }}
    >
      <Toolbar disableGutters className="dashboard-chrome-x platform-header-toolbar w-full gap-3 md:gap-4">
        <Box className="min-w-0 flex-1">
          <Typography variant="h6" component="h1" className="truncate font-bold leading-tight">
            {organizationName}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <NotificationBell />
          <ColorModeToggle size="small" />
          <ProfileMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

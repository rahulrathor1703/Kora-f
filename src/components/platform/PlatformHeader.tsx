'use client';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui';
import { env } from '@/config/env';
import { logout } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';

interface PlatformHeaderProps {
  user: AuthUser;
}

export default function PlatformHeader({ user }: PlatformHeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  async function handleLogout() {
    setAnchorEl(null);
    await logout();
    router.push('/login');
  }

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <AppBar
      position="static"
      elevation={0}
      className="platform-header shrink-0 border-b-0"
      sx={{ bgcolor: 'transparent', justifyContent: 'center' }}
    >
      <Toolbar
        disableGutters
        className="dashboard-chrome-x platform-header-toolbar w-full gap-3 md:gap-4"
        sx={{ minHeight: 0, height: '100%', alignItems: 'center' }}
      >
        <Typography
          variant="caption"
          className="hidden min-w-0 flex-1 font-semibold uppercase tracking-[0.1em] text-primary sm:block"
          sx={{ lineHeight: 1.1, fontSize: '0.65rem' }}
        >
          {env.brandName} Platform
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ThemeToggle />

          <IconButton
            type="button"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            aria-label="Open account menu"
            className="platform-user-trigger"
            size="small"
          >
            <Avatar className="platform-user-avatar">{initials}</Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: { className: 'platform-user-menu' },
            }}
          >
            <Box className="px-4 py-2">
              <Typography variant="caption" className="text-muted">
                Signed in as
              </Typography>
              <Typography variant="body2" className="font-medium text-foreground">
                {user.email}
              </Typography>
            </Box>
            <MenuItem onClick={() => void handleLogout()}>
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
              Sign out
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

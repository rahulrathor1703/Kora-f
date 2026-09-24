'use client';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useLogout, useSession } from '@/hooks/useAuth';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useResolvedEnabledModules } from '@/hooks/useResolvedEnabledModules';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';
import {
  hasNavPermission,
  hasOrgModule,
  workspaceSettingsNavItem,
} from '@/lib/workspace-navigation';

const menuItemSx = {
  gap: 1.25,
  py: 1.1,
  px: 1.5,
  borderRadius: '0.85rem',
  mx: 0.75,
};

export default function ProfileMenu() {
  const pathname = usePathname();
  const orgSlug = getOrgSlugFromPathname(pathname) ?? '';
  const toOrgPath = useOrgPath();
  const { data: session } = useSession();
  const { logout, isLoading } = useLogout();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const isSuperAdmin = isPlatformOwner(session);
  const resolvedEnabledModules = useResolvedEnabledModules();

  const permissions = useMemo(
    () => session?.permissions ?? [],
    [session?.permissions],
  );

  const showSettings = useMemo(() => {
    if (!hasOrgModule(workspaceSettingsNavItem, resolvedEnabledModules)) {
      return false;
    }

    return hasNavPermission(
      workspaceSettingsNavItem,
      permissions,
      isSuperAdmin,
    );
  }, [isSuperAdmin, permissions, resolvedEnabledModules]);

  const profileHref = toOrgPath('/settings/account');
  const settingsHref = toOrgPath(workspaceSettingsNavItem.href);
  const relativePath = orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
  const isProfileActive = relativePath.startsWith('/settings/account');
  const isSettingsActive =
    relativePath === workspaceSettingsNavItem.href ||
    relativePath.startsWith(`${workspaceSettingsNavItem.href}/`);

  const displayName = session?.username?.trim() || 'Account';
  const avatarLabel = session?.username?.charAt(0) ?? session?.email?.charAt(0) ?? '?';

  function handleClose() {
    setAnchorEl(null);
  }

  async function handleLogout() {
    handleClose();
    await logout();
  }

  return (
    <>
      <IconButton
        aria-label="Open profile menu"
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className="theme-toggle rounded-xl p-0"
        size="small"
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: 14,
            bgcolor: 'primary.main',
          }}
        >
          {avatarLabel.toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            className:
              'mt-2 min-w-[240px] overflow-hidden rounded-2xl border border-surface-border bg-surface-flyout p-0 shadow-lg backdrop-blur-md',
          },
        }}
      >
        <Box className="border-b border-surface-border bg-surface-muted/40 px-4 py-3">
          <StackProfileSummary
            displayName={displayName}
            avatarLabel={avatarLabel}
          />
        </Box>

        <Box className="py-1.5">
          <MenuItem
            component={Link}
            href={profileHref}
            onClick={handleClose}
            selected={isProfileActive}
            className="rounded-xl"
            sx={menuItemSx}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
              <PersonOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Profile"
              slotProps={{
                primary: { variant: 'body2', className: 'font-medium' },
              }}
            />
          </MenuItem>

          {showSettings ? (
            <MenuItem
              component={Link}
              href={settingsHref}
              onClick={handleClose}
              selected={isSettingsActive}
              className="rounded-xl"
              sx={menuItemSx}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                slotProps={{
                  primary: { variant: 'body2', className: 'font-medium' },
                }}
              />
            </MenuItem>
          ) : null}
        </Box>

        <Divider className="border-surface-border" />

        <Box className="py-1.5">
          <MenuItem
            onClick={() => void handleLogout()}
            disabled={isLoading}
            className="rounded-xl text-error-main"
            sx={menuItemSx}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={isLoading ? 'Logging out…' : 'Logout'}
              slotProps={{
                primary: {
                  variant: 'body2',
                  className: 'font-medium text-error-main',
                },
              }}
            />
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
}

function StackProfileSummary({
  displayName,
  avatarLabel,
}: {
  displayName: string;
  avatarLabel: string;
}) {
  return (
    <Box className="flex items-center gap-3">
      <Avatar
        sx={{
          width: 40,
          height: 40,
          fontSize: 16,
          bgcolor: 'primary.main',
        }}
      >
        {avatarLabel.toUpperCase()}
      </Avatar>
      <Box className="min-w-0">
        <Typography variant="subtitle2" className="truncate font-semibold">
          {displayName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Workspace account
        </Typography>
      </Box>
    </Box>
  );
}

'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useWorkspaceNotifications } from '@/hooks/useWorkspaceNotifications';

const menuItemSx = {
  gap: 1.25,
  py: 1.25,
  px: 1.5,
  borderRadius: '0.85rem',
  mx: 0.75,
  alignItems: 'flex-start',
};

export default function NotificationBell() {
  const toOrgPath = useOrgPath();
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const canApproveDelete = useHasPermission('email-campaigns:approve-delete');
  const canViewNotifications = canRequestDelete || canApproveDelete;
  const notifications = useWorkspaceNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const hasNotifications = notifications.length > 0;

  function handleClose() {
    setAnchorEl(null);
  }

  if (!canViewNotifications) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="Open notifications"
        aria-controls={open ? 'workspace-notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className="theme-toggle rounded-xl"
        size="small"
      >
        <Badge
          color="error"
          variant="dot"
          overlap="circular"
          invisible={!hasNotifications}
        >
          <NotificationsNoneOutlinedIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Menu
        id="workspace-notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            className:
              'mt-2 min-w-[320px] max-w-[360px] overflow-hidden rounded-2xl border border-surface-border bg-surface-flyout p-0 shadow-lg backdrop-blur-md',
          },
        }}
      >
        <Box className="border-b border-surface-border px-4 py-3">
          <Typography variant="subtitle2" className="font-semibold">
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hasNotifications
              ? `${notifications.length} item${notifications.length === 1 ? '' : 's'} need attention`
              : 'You are all caught up'}
          </Typography>
        </Box>

        {hasNotifications ? (
          <Box className="py-1.5">
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                component={Link}
                href={toOrgPath(notification.href)}
                onClick={handleClose}
                className="rounded-xl"
                sx={menuItemSx}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'error.main', mt: 0.25 }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={notification.description}
                  slotProps={{
                    primary: { variant: 'body2', className: 'font-semibold' },
                    secondary: { variant: 'caption', className: 'leading-relaxed' },
                  }}
                />
              </MenuItem>
            ))}
          </Box>
        ) : (
          <Box className="px-4 py-5">
            <Typography variant="body2" color="text.secondary" className="text-center">
              No pending delete requests right now.
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
}

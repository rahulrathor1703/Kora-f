'use client';

import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useNavNotificationDots } from '@/hooks/useNavNotificationDots';
import { stripOrgPrefix } from '@/lib/org-path';
import type { NavItem } from '@/lib/workspace-navigation';
import { isActiveRoute } from '@/lib/workspace-navigation';
import SidebarNavCollapsedLabel from './SidebarNavCollapsedLabel';
import SidebarNotificationDot from './SidebarNotificationDot';

interface SidebarExpandableNavItemProps {
  item: NavItem & { children: NavItem[] };
  isExpanded: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  orgSlug: string;
}

export default function SidebarExpandableNavItem({
  item,
  isExpanded,
  isOpen,
  onToggle,
  onNavigate,
  orgSlug,
}: SidebarExpandableNavItemProps) {
  const pathname = usePathname();
  const notificationDots = useNavNotificationDots();
  const children = item.children;
  const isParentActive =
    isActiveRoute(pathname, item.href, orgSlug) ||
    children.some((child) => isActiveRoute(pathname, child.href, orgSlug));

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const ParentIcon = item.icon;
  const parentRelativeHref = stripOrgPrefix(item.href, orgSlug);
  const showParentNotificationDot = children.some((child) => {
    const childRelativeHref = stripOrgPrefix(child.href, orgSlug);
    return notificationDots[childRelativeHref] === true;
  }) || notificationDots[parentRelativeHref] === true;

  const handleParentClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isExpanded) {
        onToggle();
        return;
      }

      setMenuAnchor(event.currentTarget);
    },
    [isExpanded, onToggle],
  );

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleChildNavigate = useCallback(() => {
    handleMenuClose();
    onNavigate?.();
  }, [handleMenuClose, onNavigate]);

  const parentButton = (
    <ListItemButton
      onClick={handleParentClick}
      aria-expanded={isExpanded ? isOpen : undefined}
      aria-label={item.label}
      className={`sidebar-nav-item group relative mb-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        isParentActive && isExpanded
          ? 'sidebar-nav-item-active'
          : 'border border-transparent hover:bg-surface-muted'
      } ${
        isExpanded
          ? 'mx-2 mb-1.5 justify-start overflow-hidden rounded-2xl px-2.5 py-2'
          : 'sidebar-nav-item-collapsed mx-0 w-full flex-col items-stretch overflow-visible px-0 py-1'
      }`}
      sx={{
        minHeight: isExpanded ? 44 : 'auto',
        borderRadius: '1rem',
        ...(isExpanded ? {} : { px: 0, alignItems: 'stretch' }),
      }}
    >
      <ListItemIcon
        className="min-w-0 justify-center"
        sx={{ mr: isExpanded ? 1.25 : 0, minWidth: isExpanded ? undefined : 0 }}
      >
        <Box
          className={`relative sidebar-nav-icon flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${
            isParentActive
              ? 'sidebar-nav-icon-active'
              : 'sidebar-nav-icon-idle group-hover:bg-primary-soft group-hover:text-primary'
          }`}
        >
          <ParentIcon sx={{ fontSize: 18 }} />
          {showParentNotificationDot ? <SidebarNotificationDot /> : null}
        </Box>
      </ListItemIcon>

      {isExpanded ? (
        <>
          <ListItemText
            primary={item.label}
            slotProps={{
              primary: {
                variant: 'body2',
                className: `truncate text-[13px] font-semibold leading-tight ${isParentActive ? 'text-primary' : ''}`,
              },
            }}
            sx={{ m: 0 }}
          />

          <Box
            className="shrink-0 opacity-100 transition-all duration-300 ease-out"
            sx={{ color: isParentActive ? 'primary.main' : 'text.secondary' }}
          >
            {isOpen ? (
              <ExpandLessRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
            )}
          </Box>
        </>
      ) : (
        <SidebarNavCollapsedLabel label={item.label} active={isParentActive} />
      )}
    </ListItemButton>
  );

  const submenu = isExpanded ? (
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <List disablePadding className="sidebar-nav-submenu mb-1">
        {children.map((child) => {
          const childActive = isActiveRoute(pathname, child.href, orgSlug);
          const ChildIcon = child.icon;
          const childRelativeHref = stripOrgPrefix(child.href, orgSlug);
          const showChildNotificationDot = notificationDots[childRelativeHref] === true;

          return (
            <Box key={child.href}>
              {child.dividerBefore ? (
                <Divider className="mx-4 my-1.5 border-surface-border" />
              ) : null}
            <ListItemButton
              component={Link}
              href={child.href}
              onClick={onNavigate}
              aria-current={childActive ? 'page' : undefined}
              aria-label={child.label}
              className={`sidebar-nav-subitem group relative mx-2 mb-0.5 overflow-hidden rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                childActive
                  ? 'sidebar-nav-subitem-active'
                  : 'border border-transparent hover:bg-surface-muted'
              }`}
              sx={{
                minHeight: 40,
                borderRadius: '0.75rem',
                pl: 2.5,
                pr: 2,
                py: 0.75,
              }}
            >
              <ListItemIcon className="min-w-0 justify-center" sx={{ mr: 1 }}>
                <Box
                  className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                    childActive
                      ? 'bg-primary-soft text-primary'
                      : 'text-muted group-hover:text-primary'
                  }`}
                >
                  <ChildIcon sx={{ fontSize: 16 }} />
                  {showChildNotificationDot ? <SidebarNotificationDot /> : null}
                </Box>
              </ListItemIcon>

              <ListItemText
                primary={child.label}
                slotProps={{
                  primary: {
                    variant: 'body2',
                    className: `truncate text-sm font-medium ${childActive ? 'text-primary' : ''}`,
                  },
                }}
                sx={{ m: 0 }}
              />
            </ListItemButton>
            </Box>
          );
        })}
      </List>
    </Collapse>
  ) : null;

  const collapsedMenu = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          className: 'sidebar-flyout-menu mt-0 min-w-[200px] rounded-2xl border border-surface bg-surface-flyout p-1 shadow-lg backdrop-blur-md',
        },
      }}
    >
      <Typography
        variant="overline"
        className="block px-3 pb-1 pt-2 font-semibold tracking-wider text-text-muted"
      >
        {item.label}
      </Typography>
      {children.map((child) => {
        const childActive = isActiveRoute(pathname, child.href, orgSlug);
        const ChildIcon = child.icon;
        const childRelativeHref = stripOrgPrefix(child.href, orgSlug);
        const showChildNotificationDot = notificationDots[childRelativeHref] === true;

        return (
          <Box key={child.href}>
            {child.dividerBefore ? (
              <Divider className="mx-2 my-1 border-surface-border" />
            ) : null}
          <MenuItem
            component={Link}
            href={child.href}
            onClick={handleChildNavigate}
            selected={childActive}
            className={`sidebar-flyout-item rounded-xl ${childActive ? 'text-primary' : ''}`}
            sx={{ gap: 1.25, py: 1, px: 1.5, borderRadius: '0.75rem' }}
          >
            <Box className="relative flex items-center justify-center">
              <ChildIcon sx={{ fontSize: 18 }} />
              {showChildNotificationDot ? <SidebarNotificationDot /> : null}
            </Box>
            <Typography variant="body2" className="font-medium">
              {child.label}
            </Typography>
          </MenuItem>
          </Box>
        );
      })}
    </Menu>
  );

  if (isExpanded) {
    return (
      <Box>
        {parentButton}
        {submenu}
      </Box>
    );
  }

  return (
    <Box>
      {parentButton}
      {collapsedMenu}
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/navigation';
import { isActiveRoute } from '@/lib/navigation';
import SidebarNavCollapsedLabel from '@/components/dashboard/SidebarNavCollapsedLabel';

interface PlatformSidebarNavItemProps {
  item: NavItem;
  isExpanded: boolean;
  onNavigate?: () => void;
}

export default function PlatformSidebarNavItem({
  item,
  isExpanded,
  onNavigate,
}: PlatformSidebarNavItemProps) {
  const pathname = usePathname();
  const active = isActiveRoute(pathname, item.href);
  const Icon = item.icon;

  const button = (
    <ListItemButton
      component={Link}
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
      className={`sidebar-nav-item group relative mb-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active && isExpanded ? 'sidebar-nav-item-active' : 'border border-transparent hover:bg-surface-muted'
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
          className={`sidebar-nav-icon flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${
            active
              ? 'sidebar-nav-icon-active'
              : 'sidebar-nav-icon-idle group-hover:bg-primary-soft group-hover:text-primary'
          }`}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
      </ListItemIcon>

      {isExpanded ? (
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              variant: 'body2',
              className: `truncate text-[13px] font-semibold leading-tight ${active ? 'text-primary' : ''}`,
            },
          }}
          sx={{ m: 0 }}
        />
      ) : (
        <SidebarNavCollapsedLabel label={item.label} active={active} />
      )}
    </ListItemButton>
  );

  return button;
}

'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/hooks/useAuth';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useResolvedEnabledModules } from '@/hooks/useResolvedEnabledModules';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import {
  getSingleVisibleMainModule,
  isActiveRoute,
  mapVisibleWorkspaceNavItems,
  shouldFlattenSingleModuleNav,
  workspaceNavItems,
} from '@/lib/workspace-navigation';
import { getOrgSlugFromPathname, orgPath } from '@/lib/org-path';
import SidebarBrand from './SidebarBrand';
import SidebarFlatModuleNavItems from './SidebarFlatModuleNavItems';
import SidebarFooter from './SidebarFooter';
import SidebarExpandableNavItem from './SidebarExpandableNavItem';
import SidebarNavItem from './SidebarNavItem';

export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const SIDEBAR_EXPANDED_WIDTH = 260;
const COLLAPSE_DELAY_MS = 180;

interface SidebarContentProps {
  isExpanded: boolean;
  onNavigate?: () => void;
  showMobileClose?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  isExpanded,
  onNavigate,
  showMobileClose = false,
  onMobileClose,
}: SidebarContentProps) {
  const pathname = usePathname();
  const orgSlug = getOrgSlugFromPathname(pathname) ?? '';
  const toOrgPath = useOrgPath();
  const { data: session } = useSession();
  const resolvedEnabledModules = useResolvedEnabledModules();
  const isSuperAdmin = isPlatformOwner(session);

  const permissions = useMemo(
    () => session?.permissions ?? [],
    [session?.permissions],
  );

  const navItems = useMemo(
    () =>
      mapVisibleWorkspaceNavItems(
        workspaceNavItems,
        resolvedEnabledModules,
        permissions,
        isSuperAdmin,
      ).map((item) => ({
        ...item,
        href: toOrgPath(item.href === '/' ? '' : item.href),
        children: item.children?.map((child) => ({
          ...child,
          href: toOrgPath(child.href),
        })),
      })),
    [isSuperAdmin, permissions, resolvedEnabledModules, toOrgPath],
  );

  const flattenSingleModuleNav = shouldFlattenSingleModuleNav(navItems);
  const singleMainModule = getSingleVisibleMainModule(navItems);
  const flattenedNavItems =
    flattenSingleModuleNav && singleMainModule?.children?.length
      ? singleMainModule.children
      : null;

  const routeActiveSectionHref = useMemo(() => {
    const active = navItems.find((item) => {
      if (!item.children?.length) {
        return false;
      }

      return (
        isActiveRoute(pathname, item.href, orgSlug) ||
        item.children.some((child) => isActiveRoute(pathname, child.href, orgSlug))
      );
    });

    return active?.href ?? null;
  }, [navItems, orgSlug, pathname]);

  const [openSectionHref, setOpenSectionHref] = useState<string | null>(
    routeActiveSectionHref,
  );
  const [syncedRouteHref, setSyncedRouteHref] = useState(routeActiveSectionHref);

  if (syncedRouteHref !== routeActiveSectionHref) {
    setSyncedRouteHref(routeActiveSectionHref);
    setOpenSectionHref(routeActiveSectionHref);
  }

  const handleSectionToggle = useCallback((href: string) => {
    setOpenSectionHref((current) => (current === href ? null : href));
  }, []);

  return (
    <Box className="relative flex h-full flex-col">
      {showMobileClose ? (
        <IconButton
          aria-label="Close navigation menu"
          onClick={onMobileClose}
          className="theme-toggle absolute right-3 top-3 z-10 rounded-xl"
          size="small"
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      ) : null}

      <SidebarBrand isExpanded={isExpanded} orgSlug={orgSlug} />

      <Box
        className={`sidebar-nav-scroll relative z-[1] min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 ${
          isExpanded ? 'px-1' : 'px-0'
        }`}
      >
        <List disablePadding>
          {flattenedNavItems ? (
            <SidebarFlatModuleNavItems
              items={flattenedNavItems}
              isExpanded={isExpanded}
              onNavigate={onNavigate}
              orgSlug={orgSlug}
            />
          ) : (
            navItems.map((item) =>
              item.children?.length ? (
                <SidebarExpandableNavItem
                  key={item.href}
                  item={{ ...item, children: item.children }}
                  isExpanded={isExpanded}
                  isOpen={openSectionHref === item.href}
                  onToggle={() => handleSectionToggle(item.href)}
                  onNavigate={onNavigate}
                  orgSlug={orgSlug}
                />
              ) : (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  isExpanded={isExpanded}
                  onNavigate={onNavigate}
                  orgSlug={orgSlug}
                />
              ),
            )
          )}
        </List>
      </Box>

      <Box className="relative z-[1]">
        <SidebarFooter isExpanded={isExpanded} />
      </Box>
    </Box>
  );
}

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onWidthChange?: (width: number) => void;
}

export default function DashboardSidebar({
  mobileOpen,
  onMobileClose,
  onWidthChange,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [isHovered, setIsHovered] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = isDesktop ? isHovered : mobileOpen;
  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isDesktop) {
      return;
    }

    clearCollapseTimer();
    setIsHovered(true);
  }, [clearCollapseTimer, isDesktop]);

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop) {
      return;
    }

    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, COLLAPSE_DELAY_MS);
  }, [clearCollapseTimer, isDesktop]);

  useEffect(() => {
    return () => {
      clearCollapseTimer();
    };
  }, [clearCollapseTimer]);

  useEffect(() => {
    onWidthChange?.(isDesktop ? sidebarWidth : 0);
  }, [isDesktop, onWidthChange, sidebarWidth]);

  return (
    <>
      <Box
        component="aside"
        aria-expanded={isExpanded}
        aria-label="Main navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`sidebar-shell sidebar-transition hidden h-full shrink-0 overflow-hidden md:block ${
          isExpanded ? 'sidebar-expanded-shadow z-20' : 'z-10'
        }`}
        sx={{ width: sidebarWidth }}
      >
        <SidebarContent isExpanded={isExpanded} />
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        className="md:hidden"
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_EXPANDED_WIDTH,
            boxSizing: 'border-box',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        <Box className="sidebar-shell sidebar-mobile-drawer h-full">
          <SidebarContent
            isExpanded
            onNavigate={onMobileClose}
            showMobileClose
            onMobileClose={onMobileClose}
          />
        </Box>
      </Drawer>
    </>
  );
}

// Re-export for SidebarNavItem
export { isActiveRoute, orgPath };

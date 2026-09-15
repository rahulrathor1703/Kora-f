'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { platformNavItems } from '@/lib/navigation';
import PlatformSidebarBrand from './PlatformSidebarBrand';
import PlatformSidebarFooter from './PlatformSidebarFooter';
import PlatformSidebarNavItem from './PlatformSidebarNavItem';

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

      <PlatformSidebarBrand isExpanded={isExpanded} />

      <Box className={`relative z-[1] flex flex-1 flex-col pt-2 ${isExpanded ? 'px-1' : 'px-0'}`}>
        <List disablePadding>
          {platformNavItems.map((item) => (
            <PlatformSidebarNavItem
              key={item.href}
              item={item}
              isExpanded={isExpanded}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Box>

      <Box className="relative z-[1]">
        <PlatformSidebarFooter isExpanded={isExpanded} />
      </Box>
    </Box>
  );
}

interface PlatformSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onWidthChange?: (width: number) => void;
}

export default function PlatformSidebar({
  mobileOpen,
  onMobileClose,
  onWidthChange,
}: PlatformSidebarProps) {
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

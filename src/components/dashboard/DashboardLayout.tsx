'use client';

import Box from '@mui/material/Box';
import { useCallback, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar, { SIDEBAR_COLLAPSED_WIDTH } from './DashboardSidebar';
import TenantViewBanner from './TenantViewBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  mainClassName?: string;
}

export default function DashboardLayout({
  children,
  mainClassName = 'app-mesh',
}: DashboardLayoutProps) {
  const [sidebarOffset, setSidebarOffset] = useState(SIDEBAR_COLLAPSED_WIDTH);

  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarOffset(width);
  }, []);

  return (
    <Box
      className="flex h-screen overflow-hidden"
      style={{ '--sidebar-offset': `${sidebarOffset}px` } as React.CSSProperties}
    >
      <DashboardSidebar
        mobileOpen={false}
        onMobileClose={() => {}}
        onWidthChange={handleSidebarWidthChange}
      />

      <Box className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TenantViewBanner />
        <DashboardHeader />
        <Box
          component="main"
          className={`${mainClassName} min-h-0 flex-1 overflow-y-auto overflow-x-hidden`}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

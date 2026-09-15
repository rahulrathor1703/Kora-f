'use client';

import Box from '@mui/material/Box';
import { useCallback, useState } from 'react';
import type { AuthUser } from '@/lib/api/auth';
import PlatformHeader from './PlatformHeader';
import PlatformSidebar, { SIDEBAR_COLLAPSED_WIDTH } from './PlatformSidebar';

interface PlatformShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export default function PlatformShell({ user, children }: PlatformShellProps) {
  const [sidebarOffset, setSidebarOffset] = useState(SIDEBAR_COLLAPSED_WIDTH);

  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarOffset(width);
  }, []);

  return (
    <Box
      className="platform-shell flex h-screen overflow-hidden"
      style={{ '--sidebar-offset': `${sidebarOffset}px` } as React.CSSProperties}
    >
      <PlatformSidebar
        mobileOpen={false}
        onMobileClose={() => {}}
        onWidthChange={handleSidebarWidthChange}
      />

      <Box className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PlatformHeader user={user} />
        <Box
          component="main"
          className="platform-canvas min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

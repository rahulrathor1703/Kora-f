'use client';

import Box from '@mui/material/Box';
import type { AuthUser } from '@/lib/api/auth';
import WorkspaceHeader from './WorkspaceHeader';

interface WorkspaceShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export default function WorkspaceShell({ user, children }: WorkspaceShellProps) {
  return (
    <Box className="platform-shell flex h-screen overflow-hidden">
      <Box className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <WorkspaceHeader user={user} />
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

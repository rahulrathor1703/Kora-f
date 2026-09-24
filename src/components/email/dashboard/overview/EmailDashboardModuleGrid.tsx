'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmailDashboardModuleSection from '@/components/email/dashboard/overview/EmailDashboardModuleSection';
import type { EmailDashboardModuleSnapshot } from '@/hooks/useEmailDashboardSummary';

interface EmailDashboardModuleGridProps {
  snapshots: EmailDashboardModuleSnapshot[];
  isLoading?: boolean;
}

export default function EmailDashboardModuleGrid({
  snapshots,
  isLoading = false,
}: EmailDashboardModuleGridProps) {
  if (snapshots.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          variant="caption"
          className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Email modules
        </Typography>
        <Divider className="flex-1" />
      </Stack>

      <Box className="settings-hub-grid">
        {snapshots.map((snapshot) => (
          <EmailDashboardModuleSection
            key={snapshot.id}
            snapshot={snapshot}
            isLoading={isLoading}
          />
        ))}
      </Box>
    </Stack>
  );
}

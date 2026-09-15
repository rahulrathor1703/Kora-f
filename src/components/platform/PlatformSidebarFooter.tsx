'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PlatformSidebarFooterProps {
  isExpanded: boolean;
}

export default function PlatformSidebarFooter({
  isExpanded,
}: PlatformSidebarFooterProps) {
  return (
    <Box className="sidebar-footer mt-auto border-t border-surface-border px-3 py-4">
      {isExpanded ? (
        <Box className="sidebar-footer-expanded rounded-2xl border border-surface-border bg-surface-muted px-3 py-2.5">
          <Typography variant="caption" className="block font-semibold text-primary">
            Platform admin
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-0.5 block leading-snug">
            Manage all tenant organizations.
          </Typography>
        </Box>
      ) : (
        <Box className="flex flex-col items-center gap-1 text-muted">
          <ChevronRightRoundedIcon sx={{ fontSize: 16 }} className="sidebar-footer-chevron" />
          <Typography
            variant="caption"
            className="sidebar-footer-hint text-[10px] font-medium uppercase tracking-[0.14em]"
          >
            Expand
          </Typography>
        </Box>
      )}
    </Box>
  );
}

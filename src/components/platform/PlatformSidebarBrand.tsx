'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { env } from '@/config/env';

interface PlatformSidebarBrandProps {
  isExpanded: boolean;
}

export default function PlatformSidebarBrand({
  isExpanded,
}: PlatformSidebarBrandProps) {
  return (
    <Box
      className={`platform-chrome-row relative flex items-center px-3 ${
        isExpanded ? 'gap-3' : 'justify-center'
      }`}
    >
      <Box
        className="platform-brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
        aria-hidden="true"
      >
        {env.brandName.charAt(0)}
      </Box>

      <Box
        className={`min-w-0 overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'w-auto translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0'
        }`}
      >
        <Typography variant="subtitle1" className="truncate font-bold leading-none">
          {env.brandName}
        </Typography>
        <Typography variant="caption" className="mt-1 block truncate text-header-muted">
          Platform
        </Typography>
      </Box>
    </Box>
  );
}

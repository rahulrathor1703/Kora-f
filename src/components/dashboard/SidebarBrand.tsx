'use client';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { env } from '@/config/env';

interface SidebarBrandProps {
  isExpanded: boolean;
  orgSlug: string;
}

export default function SidebarBrand({ isExpanded, orgSlug }: SidebarBrandProps) {
  return (
    <Box
      className={`platform-chrome-row relative flex items-center px-3 ${
        isExpanded ? 'gap-3' : 'justify-center'
      }`}
    >
      <Box className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
        <BusinessOutlinedIcon fontSize="small" />
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
          /{orgSlug}
        </Typography>
      </Box>
    </Box>
  );
}

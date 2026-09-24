'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useImpersonation } from '@/contexts/impersonation';

export default function TenantViewBanner() {
  const { organization, isImpersonating, exitImpersonation } = useImpersonation();

  if (!isImpersonating || !organization) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-label="Platform admin tenant view"
      className="tenant-view-banner shrink-0 border-b border-amber-200/80 bg-amber-50 px-4 py-2 dark:border-amber-400/20 dark:bg-amber-950/40"
    >
      <Box className="dashboard-chrome-x flex flex-wrap items-center justify-between gap-3">
        <Typography variant="body2" className="font-medium text-amber-950 dark:text-amber-100">
          Viewing <strong>{organization.name}</strong> · Platform admin mode
        </Typography>

        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon fontSize="small" />}
          onClick={() => void exitImpersonation()}
          className="border-amber-300 text-amber-950 hover:border-amber-400 dark:border-amber-500/40 dark:text-amber-50"
        >
          Exit to platform
        </Button>
      </Box>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import GlobalSuppressionsPanel from '@/components/email/excluded/GlobalSuppressionsPanel';

export default function ExcludedContent() {
  return (
    <Box className="dashboard-panel rounded-2xl p-4 md:p-6">
      <GlobalSuppressionsPanel />
    </Box>
  );
}

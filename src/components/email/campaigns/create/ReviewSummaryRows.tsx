'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ReviewSummaryRowProps {
  label: string;
  value: string;
}

export function ReviewSummaryRow({ label, value }: ReviewSummaryRowProps) {
  return (
    <Box className="flex items-start justify-between gap-3 py-1">
      <Typography variant="body2" color="text.secondary" className="shrink-0">
        {label}
      </Typography>
      <Typography variant="body2" className="text-right font-medium">
        {value}
      </Typography>
    </Box>
  );
}

export function ReviewSummaryRows({ children }: { children: React.ReactNode }) {
  return (
    <Stack divider={<Box className="border-t border-surface-border" />}>
      {children}
    </Stack>
  );
}

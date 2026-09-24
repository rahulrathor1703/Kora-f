'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  getEmailDashboardTagline,
  getTimeBasedGreeting,
} from '@/lib/email/dashboard/greeting';

interface EmailDashboardHeaderProps {
  onAddWidget: () => void;
  addWidgetDisabled?: boolean;
}

export default function EmailDashboardHeader({
  onAddWidget,
  addWidgetDisabled = false,
}: EmailDashboardHeaderProps) {
  const greeting = getTimeBasedGreeting();
  const tagline = getEmailDashboardTagline();

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2.5}
      sx={{ alignItems: { lg: 'flex-start' }, justifyContent: 'space-between' }}
    >
      <Box className="min-w-0">
        <Typography variant="h4" component="h1" className="font-bold tracking-tight">
          {greeting}, Welcome back
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mt-1">
          {tagline}
        </Typography>
      </Box>

      <Button
        type="button"
        variant="contained"
        startIcon={<AddIcon fontSize="small" />}
        disabled={addWidgetDisabled}
        onClick={onAddWidget}
        className="shrink-0 rounded-2xl px-5 py-2.5 normal-case shadow-primary-soft"
      >
        Add Widget
      </Button>
    </Stack>
  );
}

export function EmailDashboardPerformanceError({ message }: { message: string }) {
  return (
    <Alert severity="warning" className="rounded-2xl">
      Some performance metrics could not be loaded: {message}
    </Alert>
  );
}

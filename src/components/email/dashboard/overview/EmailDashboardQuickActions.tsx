'use client';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { EmailDashboardQuickActionItem } from '@/hooks/useEmailDashboardSummary';

interface EmailDashboardQuickActionsProps {
  actions: EmailDashboardQuickActionItem[];
}

export default function EmailDashboardQuickActions({
  actions,
}: EmailDashboardQuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          variant="caption"
          className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Quick actions
        </Typography>
        <Divider className="flex-1" />
      </Stack>

      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Card
            key={action.title}
            className="dashboard-panel h-full rounded-[20px] shadow-none"
          >
            <CardActionArea component={Link} href={action.href} sx={{ height: '100%' }}>
              <CardContent className="p-4">
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ChevronRightOutlinedIcon fontSize="small" className="opacity-80" />
                  </Box>
                  <Box className="min-w-0 flex-1">
                    <Typography variant="body1" className="font-semibold">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="mt-0.5">
                      {action.subtext}
                    </Typography>
                  </Box>
                  <ChevronRightOutlinedIcon fontSize="small" className="text-muted" />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

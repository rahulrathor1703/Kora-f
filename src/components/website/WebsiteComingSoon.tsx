'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { WebsiteTab } from '@/lib/website/navigation';

interface WebsiteComingSoonProps {
  tab: WebsiteTab;
}

export default function WebsiteComingSoon({ tab }: WebsiteComingSoonProps) {
  const Icon = tab.icon;

  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent className="flex min-h-[320px] items-center justify-center p-8 md:p-12">
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }} className="max-w-md">
          <Box className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" className="font-bold">
            {tab.label}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tab.description}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-2">
            Planned for a future release
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

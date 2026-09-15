'use client';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EmailCampaign } from '@/lib/email/campaigns/types';

interface AiPlusTabProps {
  campaign: EmailCampaign;
}

export default function AiPlusTab({ campaign }: AiPlusTabProps) {
  return (
    <Box className="dashboard-panel rounded-2xl p-4 md:p-6">
      <Stack spacing={2.5} sx={{ alignItems: 'center', py: 6, textAlign: 'center' }}>
        <Box
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          aria-hidden
        >
          <AutoAwesomeOutlinedIcon fontSize="large" />
        </Box>

        <Stack spacing={1} sx={{ maxWidth: 420 }}>
          <Typography variant="subtitle1" className="font-bold">
            AI Plus
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered insights and actions for {campaign.name} will appear here.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

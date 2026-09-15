'use client';

import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CampaignWizardStepId } from '@/lib/email/campaigns/wizard-types';

const PLACEHOLDER_COPY: Record<
  Exclude<CampaignWizardStepId, 'basic-info'>,
  { title: string; description: string }
> = {
  sequence: {
    title: 'Sequence builder coming soon',
    description:
      'Define your email sequence, templates, and follow-up timing in this step.',
  },
  audience: {
    title: 'Audience selection coming soon',
    description:
      'Choose lists, segments, and targeting rules for who receives this campaign.',
  },
  schedule: {
    title: 'Schedule settings coming soon',
    description:
      'Set your launch date, daily batch size, and sending window.',
  },
  review: {
    title: 'Review coming soon',
    description:
      'Check mailbox capacity and campaign details before scheduling.',
  },
};

interface PlaceholderStepProps {
  stepId: Exclude<CampaignWizardStepId, 'basic-info'>;
}

export default function PlaceholderStep({ stepId }: PlaceholderStepProps) {
  const copy = PLACEHOLDER_COPY[stepId];

  return (
    <Box className="flex min-h-[280px] items-center justify-center py-8">
      <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 420, textAlign: 'center' }}>
        <Box className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ConstructionOutlinedIcon />
        </Box>
        <Typography variant="h6" className="font-bold">
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {copy.description}
        </Typography>
      </Stack>
    </Box>
  );
}

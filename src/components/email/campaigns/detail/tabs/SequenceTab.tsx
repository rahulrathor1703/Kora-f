'use client';

import Stack from '@mui/material/Stack';
import CampaignDetailsPanel from '@/components/email/campaigns/detail/CampaignDetailsPanel';
import SequenceStepReadOnly from '@/components/email/campaigns/detail/SequenceStepReadOnly';
import type { EmailCampaign } from '@/lib/email/campaigns/types';

interface SequenceTabProps {
  campaign: EmailCampaign;
}

export default function SequenceTab({ campaign }: SequenceTabProps) {
  const sortedSteps = [...campaign.steps].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );

  return (
    <Stack spacing={2.5}>
      <CampaignDetailsPanel campaign={campaign} />

      <Stack spacing={2.5}>
        {sortedSteps.map((step) => (
          <SequenceStepReadOnly key={step.id} step={step} />
        ))}
      </Stack>
    </Stack>
  );
}

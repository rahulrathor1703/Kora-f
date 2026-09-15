'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormContext, useWatch } from 'react-hook-form';
import SequenceStepReadOnly from '@/components/email/campaigns/detail/SequenceStepReadOnly';
import { mapWizardFormToPreviewSteps } from '@/lib/email/campaigns/sequence-preview-utils';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

interface SequenceTemplatePreviewProps {
  templateName: string;
  onCustomize: () => void;
}

export default function SequenceTemplatePreview({
  templateName,
  onCustomize,
}: SequenceTemplatePreviewProps) {
  const { control } = useFormContext<CampaignWizardFormValues>();
  const initialOutreach = useWatch({ control, name: 'initialOutreach' });
  const followUps = useWatch({ control, name: 'followUps' }) ?? [];
  const previewSteps = mapWizardFormToPreviewSteps({
    initialOutreach,
    followUps,
  });

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h6" component="h2" className="font-bold">
          Review your sequence
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Emails from <strong>{templateName}</strong>. Customize if needed.
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        {previewSteps.map((step) => (
          <SequenceStepReadOnly
            key={step.stepOrder}
            step={step}
          />
        ))}
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={onCustomize}
          className="rounded-2xl px-4"
        >
          Customize
        </Button>
      </Stack>
    </Stack>
  );
}

'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { Controller, useFormContext } from 'react-hook-form';
import FollowUpTimingFields from '@/components/email/campaigns/shared/FollowUpTimingFields';
import SequenceEmailFields from '@/components/email/campaigns/create/sequence/SequenceEmailFields';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';
import { getTodayDateInputValue } from '@/lib/email/campaigns/schedule-utils';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

interface FollowUpCardProps {
  index: number;
  stepNumber: number;
  onRemove: () => void;
  divided?: boolean;
}

export default function FollowUpCard({
  index,
  stepNumber,
  onRemove,
  divided = false,
}: FollowUpCardProps) {
  const { control, watch } = useFormContext<CampaignWizardFormValues>();
  const launchDate = watch('launchDate');
  const subjectHtmlId = `follow-up-${index}-subject`;
  const bodyHtmlId = `follow-up-${index}-body`;

  return (
    <WizardFormSection
      title={`Step ${stepNumber} — Follow-up ${index + 1}`}
      divided={divided}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <FollowUpTimingFields
          control={control}
          delayModeName={`followUps.${index}.delayMode`}
          delayDaysName={`followUps.${index}.delayDays`}
          scheduledDateName={`followUps.${index}.scheduledDate`}
          minDate={launchDate || getTodayDateInputValue()}
        />

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Controller
            name={`followUps.${index}.includeSignature`}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value ?? true}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                }
                label="Signature"
                className="mx-0"
              />
            )}
          />

          <Box
            aria-hidden
            sx={{
              width: '1px',
              height: 24,
              bgcolor: 'divider',
              flexShrink: 0,
            }}
          />

          <Tooltip title="Delete follow-up">
            <IconButton
              size="small"
              color="error"
              onClick={onRemove}
              aria-label="Delete follow-up"
              className="rounded-xl border border-error/30"
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <SequenceEmailFields
        subjectName={`followUps.${index}.subject`}
        bodyName={`followUps.${index}.body`}
        subjectHtmlId={subjectHtmlId}
        bodyHtmlId={bodyHtmlId}
        stepOrder={stepNumber}
      />
    </WizardFormSection>
  );
}

'use client';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import MailboxMultiPicker from '@/components/email/campaigns/create/MailboxMultiPicker';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';
import CampaignAdvancedFieldsDrawer, {
  countFilledAdvancedFields,
} from '@/components/email/campaigns/shared/CampaignAdvancedFieldsDrawer';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function BasicInfoStep() {
  const { control, watch } = useFormContext<CampaignWizardFormValues>();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const type = watch('type') ?? '';
  const brand = watch('brand') ?? '';
  const region = watch('region') ?? '';
  const customFieldValues = watch('customFieldValues') ?? {};
  const filledCount = countFilledAdvancedFields({
    type,
    brand,
    region,
    customFieldValues,
  });

  return (
    <Stack spacing={4}>
      <WizardFormSection
        title="Campaign details"
        headerAction={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {filledCount > 0 ? (
              <Chip
                label={`${filledCount} field${filledCount === 1 ? '' : 's'} set`}
                size="small"
                color="primary"
                variant="outlined"
                className="rounded-lg"
              />
            ) : null}
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setAdvancedOpen(true)}
              className="w-fit rounded-lg normal-case px-2.5"
            >
              Advanced options
            </Button>
          </Stack>
        }
      >
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <WizardFieldLabel required htmlFor="name">
              Campaign name
            </WizardFieldLabel>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  id="name"
                  fullWidth
                  autoComplete="off"
                  placeholder="e.g. InsureOps India Brokers Q3"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  className="rounded-xl"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <WizardFieldLabel htmlFor="goal">
              Goal <span className="font-normal text-text-secondary">(optional)</span>
            </WizardFieldLabel>
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="goal"
                  fullWidth
                  placeholder="What should this campaign achieve?"
                  className="rounded-xl"
                />
              )}
            />
          </Grid>
        </Grid>
      </WizardFormSection>

      <MailboxMultiPicker />

      <CampaignAdvancedFieldsDrawer
        mode="wizard"
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
      />
    </Stack>
  );
}

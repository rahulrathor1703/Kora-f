'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import {
  buildTimezoneOptions,
  formatTimezoneLabel,
} from '@/lib/email/campaigns/schedule-utils';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function TimezoneSelectField() {
  const { control } = useFormContext<CampaignWizardFormValues>();
  const timezoneOptions = useMemo(() => buildTimezoneOptions(), []);

  return (
    <>
      <WizardFieldLabel required htmlFor="timezone">
        Timezone
      </WizardFieldLabel>
      <Controller
        name="timezone"
        control={control}
        render={({ field, fieldState }) => (
          <Autocomplete
            id="timezone"
            options={timezoneOptions}
            value={
              timezoneOptions.find((option) => option.value === field.value) ??
              null
            }
            onChange={(_event, option) => field.onChange(option?.value ?? '')}
            getOptionLabel={(option) =>
              `${option.label} (${option.offsetLabel})`
            }
            isOptionEqualToValue={(left, right) => left.value === right.value}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={
                  fieldState.error?.message ??
                  (field.value
                    ? `Campaign schedule uses ${formatTimezoneLabel(field.value, timezoneOptions)}.`
                    : 'Select the timezone used for launch date and sending window.')
                }
                className="rounded-xl"
              />
            )}
          />
        )}
      />
    </>
  );
}

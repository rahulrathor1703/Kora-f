'use client';

import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import ActiveWeekdaysPicker from '@/components/email/campaigns/create/ActiveWeekdaysPicker';
import TimezoneSelectField from '@/components/email/campaigns/create/TimezoneSelectField';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';
import WizardStepIntro from '@/components/email/campaigns/create/WizardStepIntro';
import { useMailboxes } from '@/hooks/useMailboxes';
import {
  buildDailyBatchCapacityHelperText,
  computeTotalDailyCapacity,
  resolveSelectedMailboxes,
} from '@/lib/email/campaigns/mailbox-capacity';
import {
  buildSendingWindowOptions,
  getTodayDateInputValue,
} from '@/lib/email/campaigns/schedule-utils';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

const WINDOW_OPTIONS = buildSendingWindowOptions();

interface ScheduleStepProps {
  embedded?: boolean;
}

export default function ScheduleStep({ embedded = false }: ScheduleStepProps) {
  const { control, watch } = useFormContext<CampaignWizardFormValues>();
  const dailyBatchSize = watch('dailyBatchSize');
  const mailboxSenders = watch('mailboxSenders');
  const sendingWindowStartMinutes = watch('sendingWindowStartMinutes');
  const timezone = watch('timezone');

  const { mailboxes } = useMailboxes();

  const selectedMailboxes = resolveSelectedMailboxes(
    mailboxSenders ?? [],
    mailboxes,
  );
  const mailboxCapacity = computeTotalDailyCapacity(selectedMailboxes);
  const dailyBatchCapacityHelperText =
    selectedMailboxes.length === 0
      ? 'Select mailboxes in the Details step to see daily send capacity.'
      : buildDailyBatchCapacityHelperText(dailyBatchSize, mailboxCapacity);

  return (
    <Stack spacing={embedded ? 0 : 2.5}>
      {embedded ? null : (
        <WizardStepIntro
          title="Schedule"
          description="Set your launch date, daily batch size, and sending window."
        />
      )}

      <WizardFormSection divided={false}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <WizardFieldLabel required htmlFor="launchDate">
              Launch date
            </WizardFieldLabel>
            <Controller
              name="launchDate"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  id="launchDate"
                  type="date"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    htmlInput: {
                      min: getTodayDateInputValue(timezone),
                    },
                  }}
                  className="rounded-xl"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <WizardFieldLabel htmlFor="dailyBatchSize">
              Batch size
            </WizardFieldLabel>
            <Controller
              name="dailyBatchSize"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  id="dailyBatchSize"
                  type="number"
                  fullWidth
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message ?? dailyBatchCapacityHelperText
                  }
                  className="rounded-xl"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TimezoneSelectField />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <ActiveWeekdaysPicker />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="sendingWindowStartMinutes"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Sending window start"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                  className="rounded-xl"
                >
                  {WINDOW_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="sendingWindowEndMinutes"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Sending window end"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                  className="rounded-xl"
                >
                  {WINDOW_OPTIONS.filter(
                    (option) => option.value > sendingWindowStartMinutes,
                  ).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      </WizardFormSection>
    </Stack>
  );
}

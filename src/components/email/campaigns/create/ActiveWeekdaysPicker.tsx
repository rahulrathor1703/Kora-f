'use client';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import ToggleButton from '@mui/material/ToggleButton';
import { Controller, useFormContext } from 'react-hook-form';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import { WEEKDAY_OPTIONS } from '@/lib/email/campaigns/schedule-utils';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function ActiveWeekdaysPicker() {
  const { control } = useFormContext<CampaignWizardFormValues>();

  return (
    <>
      <WizardFieldLabel required>Active days</WizardFieldLabel>
      <Controller
        name="activeWeekdays"
        control={control}
        render={({ field, fieldState }) => (
          <Box>
            <Box
              className="flex w-full gap-1.5"
              role="group"
              aria-label="Active send days"
            >
              {WEEKDAY_OPTIONS.map((option) => {
                const selected = field.value.includes(option.value);

                return (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    selected={selected}
                    aria-label={option.label}
                    className="min-w-0 flex-1 rounded-xl px-2 py-2 normal-case"
                    sx={(theme) => {
                      const activeGreen = `color-mix(in srgb, ${theme.palette.success.main} 18%, ${theme.palette.background.paper})`;
                      const activeGreenHover = `color-mix(in srgb, ${theme.palette.success.main} 26%, ${theme.palette.background.paper})`;

                      return {
                        borderColor: theme.palette.divider,
                        color: selected
                          ? theme.palette.success.dark
                          : theme.palette.text.secondary,
                        backgroundColor: selected
                          ? activeGreen
                          : theme.palette.grey[50],
                        '&:hover': {
                          backgroundColor: selected
                            ? activeGreenHover
                            : theme.palette.grey[100],
                        },
                        '&.Mui-selected': {
                          color: theme.palette.success.dark,
                          backgroundColor: activeGreen,
                          '&:hover': {
                            backgroundColor: activeGreenHover,
                          },
                        },
                      };
                    }}
                    onChange={() => {
                      const nextValue = selected
                        ? field.value.filter((day) => day !== option.value)
                        : [...field.value, option.value];

                      if (nextValue.length === 0) {
                        return;
                      }

                      field.onChange(
                        [...nextValue].sort((left, right) => left - right),
                      );
                    }}
                  >
                    {option.label}
                  </ToggleButton>
                );
              })}
            </Box>
            <FormHelperText error={Boolean(fieldState.error)}>
              {fieldState.error?.message ??
                'Sending runs on the days you select; all other days are skipped.'}
            </FormHelperText>
          </Box>
        )}
      />
    </>
  );
}

'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface FollowUpTimingFieldsProps<T extends FieldValues> {
  control: Control<T>;
  delayModeName: FieldPath<T>;
  delayDaysName: FieldPath<T>;
  scheduledDateName: FieldPath<T>;
  minDate?: string;
}

export default function FollowUpTimingFields<T extends FieldValues>({
  control,
  delayModeName,
  delayDaysName,
  scheduledDateName,
  minDate,
}: FollowUpTimingFieldsProps<T>) {
  const minDateTime = minDate
    ? DateTime.fromISO(minDate).startOf('day')
    : DateTime.now().startOf('day');

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary">
        Send
      </Typography>
      <Controller
        name={delayModeName}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            size="small"
            className="min-w-[10rem] rounded-xl"
            onChange={(event) => field.onChange(event.target.value)}
          >
            <MenuItem value="relative">after no reply</MenuItem>
            <MenuItem value="absolute">on date</MenuItem>
          </TextField>
        )}
      />
      <Controller
        name={delayModeName}
        control={control}
        render={({ field: modeField }) =>
          modeField.value === 'absolute' ? (
            <Controller
              name={scheduledDateName}
              control={control}
              render={({ field, fieldState }) => (
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                  <DatePicker
                    value={
                      field.value
                        ? DateTime.fromISO(String(field.value))
                        : null
                    }
                    onChange={(value) =>
                      field.onChange(value?.toISODate() ?? '')
                    }
                    minDate={minDateTime}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error: Boolean(fieldState.error),
                        helperText: fieldState.error?.message,
                        className: 'min-w-[10rem] rounded-xl',
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Controller
                name={delayDaysName}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value) || 1)
                    }
                    className="w-20 rounded-xl"
                  />
                )}
              />
              <Typography variant="body2" color="text.secondary">
                days later
              </Typography>
            </Stack>
          )
        }
      />
    </Stack>
  );
}

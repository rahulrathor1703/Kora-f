'use client';

import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { useState } from 'react';

const WIZARD_DATE_LOCALE_TEXT = {
  fieldMonthPlaceholder: () => 'mm',
  fieldDayPlaceholder: () => 'dd',
  fieldYearPlaceholder: (params: { digitAmount: number }) =>
    'y'.repeat(params.digitAmount),
};

interface WizardDatePickerFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

function parseIsoDate(value: string): DateTime | null {
  if (!value) {
    return null;
  }

  const parsed = DateTime.fromISO(value).startOf('day');
  return parsed.isValid ? parsed : null;
}

export default function WizardDatePickerField({
  id,
  value,
  onChange,
  minDate,
  error = false,
  helperText,
  disabled = false,
}: WizardDatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const minDateTime = minDate ? parseIsoDate(minDate) : undefined;

  function openPicker() {
    if (disabled) {
      return;
    }

    setOpen(true);
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterLuxon}
      localeText={WIZARD_DATE_LOCALE_TEXT}
    >
      <DatePicker
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={parseIsoDate(value)}
        onChange={(next) => {
          onChange(next?.toISODate() ?? '');
          setOpen(false);
        }}
        minDate={minDateTime ?? undefined}
        disabled={disabled}
        format="MM/dd/yyyy"
        slots={{
          openPickerIcon: CalendarTodayOutlinedIcon,
        }}
        slotProps={{
          textField: {
            id,
            fullWidth: true,
            error,
            helperText,
            className: 'rounded-xl',
            onClick: openPicker,
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPicker();
              }
            },
            sx: {
              cursor: disabled ? undefined : 'pointer',
              '& .MuiPickersInputBase-root': {
                cursor: disabled ? undefined : 'pointer',
              },
              '& .MuiPickersSectionList-root': {
                cursor: disabled ? undefined : 'pointer',
              },
            },
          },
          openPickerButton: {
            className: 'text-text-secondary',
            onClick: (event) => {
              event.stopPropagation();
              openPicker();
            },
          },
          popper: {
            placement: 'bottom-start',
            sx: {
              '& .MuiPaper-root': {
                borderRadius: '12px',
                border:
                  '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)',
                boxShadow:
                  '0 12px 40px color-mix(in srgb, var(--foreground) 14%, transparent)',
              },
            },
          },
          day: {
            sx: {
              borderRadius: '10px',
              fontWeight: 500,
              '&.Mui-selected': {
                fontWeight: 700,
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}

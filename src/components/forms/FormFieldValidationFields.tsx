'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FORM_FIELD_VALIDATION_TYPE_OPTIONS } from '@/lib/forms/form-field-validation.types';
import type { FormFieldValidationType } from '@/lib/forms/form-field-validation.types';
import { formBuilderFieldClassName } from '@/lib/forms/form-builder-dialog.styles';

interface FormFieldValidationFieldsProps {
  minLength?: number;
  maxLength?: number;
  validationType?: FormFieldValidationType;
  onMinLengthChange: (value: number | undefined) => void;
  onMaxLengthChange: (value: number | undefined) => void;
  onValidationTypeChange: (value: FormFieldValidationType | undefined) => void;
  disabled?: boolean;
}

function parseOptionalPositiveInt(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export default function FormFieldValidationFields({
  minLength,
  maxLength,
  validationType,
  onMinLengthChange,
  onMaxLengthChange,
  onValidationTypeChange,
  disabled = false,
}: FormFieldValidationFieldsProps) {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary" className="text-[13px] leading-relaxed">
        Optional rules applied when users submit this field. Leave blank for no extra checks.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Min. Length"
          value={minLength ?? ''}
          onChange={(event) =>
            onMinLengthChange(parseOptionalPositiveInt(event.target.value))
          }
          placeholder="e.g. 3"
          fullWidth
          disabled={disabled}
          className={formBuilderFieldClassName}
          slotProps={{ htmlInput: { inputMode: 'numeric', min: 0 } }}
        />
        <TextField
          label="Max. Length"
          value={maxLength ?? ''}
          onChange={(event) =>
            onMaxLengthChange(parseOptionalPositiveInt(event.target.value))
          }
          placeholder="e.g. 100"
          fullWidth
          disabled={disabled}
          className={formBuilderFieldClassName}
          slotProps={{ htmlInput: { inputMode: 'numeric', min: 0 } }}
        />
      </Stack>

      <TextField
        select
        label="Validation Type"
        value={validationType ?? ''}
        onChange={(event) => {
          const next = event.target.value;
          onValidationTypeChange(
            next ? (next as FormFieldValidationType) : undefined,
          );
        }}
        fullWidth
        disabled={disabled}
        className={formBuilderFieldClassName}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value="">
          <span className="text-slate-500">Select type</span>
        </MenuItem>
        {FORM_FIELD_VALIDATION_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}

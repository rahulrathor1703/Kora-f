'use client';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import FormFieldRowWidthSelector from '@/components/forms/FormFieldRowWidthSelector';
import {
  formBuilderFieldClassName,
  formBuilderPropertiesStackSpacing,
} from '@/lib/forms/form-builder-dialog.styles';

interface FormFieldPropertiesTabFieldsProps {
  label: string;
  onLabelChange: (value: string) => void;
  required: boolean;
  onRequiredChange: (value: boolean) => void;
  formColSpan: number;
  onFormColSpanChange: (colSpan: number) => void;
  fieldTypeLabel?: string;
  fieldKeyLabel?: string;
  disabled?: boolean;
  autoFocusLabel?: boolean;
  extraContent?: ReactNode;
}

export default function FormFieldPropertiesTabFields({
  label,
  onLabelChange,
  required,
  onRequiredChange,
  formColSpan,
  onFormColSpanChange,
  fieldTypeLabel,
  fieldKeyLabel,
  disabled = false,
  autoFocusLabel = false,
  extraContent,
}: FormFieldPropertiesTabFieldsProps) {
  return (
    <Stack spacing={formBuilderPropertiesStackSpacing}>
      <TextField
        label="Field Label"
        value={label}
        onChange={(event) => onLabelChange(event.target.value)}
        autoFocus={autoFocusLabel}
        fullWidth
        required
        disabled={disabled}
        className={formBuilderFieldClassName}
      />

      <BoxedToggleRow
        label="Required"
        checked={required}
        onChange={onRequiredChange}
        disabled={disabled}
      />

      <FormFieldRowWidthSelector
        colSpan={formColSpan}
        onChange={onFormColSpanChange}
        disabled={disabled}
      />

      {extraContent}

      {fieldTypeLabel ? (
        <Typography
          variant="caption"
          component="p"
          className="pt-0.5 text-[12px] text-slate-500"
        >
          Field type:{' '}
          <span className="font-medium text-slate-600">{fieldTypeLabel}</span>
          {fieldKeyLabel ? (
            <>
              {' '}
              ·{' '}
              <span className="font-mono text-[11px] text-slate-500">
                {fieldKeyLabel}
              </span>
            </>
          ) : null}
        </Typography>
      ) : null}
    </Stack>
  );
}

function BoxedToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <FormControlLabel
      className={[
        'm-0 w-full justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30',
      ].join(' ')}
      control={
        <Switch
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          size="small"
        />
      }
      label={
        <Typography variant="body2" className="text-[13px] font-medium text-slate-800">
          {label}
        </Typography>
      }
      labelPlacement="start"
      sx={{
        '& .MuiFormControlLabel-label': { flex: 1 },
      }}
    />
  );
}

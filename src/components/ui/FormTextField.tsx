'use client';

import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

interface RhfFormTextFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

interface ControlledFormTextFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  startIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

export type FormTextFieldProps<T extends FieldValues = FieldValues> =
  | RhfFormTextFieldProps<T>
  | ControlledFormTextFieldProps;

function isRhfProps<T extends FieldValues>(
  props: FormTextFieldProps<T>,
): props is RhfFormTextFieldProps<T> {
  return 'control' in props && 'name' in props;
}

export default function FormTextField<T extends FieldValues>(
  props: FormTextFieldProps<T>,
) {
  if (isRhfProps(props)) {
    const {
      name,
      control,
      label,
      type = 'text',
      autoComplete,
      disabled = false,
      placeholder,
      helperText,
    } = props;

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            id={name}
            label={label}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            fullWidth
            required
            disabled={disabled}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? helperText}
            slotProps={{
              input: {
                'aria-invalid': fieldState.error ? true : undefined,
              },
            }}
            className="rounded-xl"
          />
        )}
      />
    );
  }

  const {
    label,
    value,
    onChange,
    type = 'text',
    autoComplete,
    required = false,
    disabled = false,
    placeholder,
    startIcon,
    endAdornment,
    error,
    helperText,
  } = props;

  const slotProps: TextFieldProps['slotProps'] = {
    input: {
      startAdornment: startIcon ? (
        <InputAdornment position="start">{startIcon}</InputAdornment>
      ) : undefined,
      endAdornment: endAdornment ? (
        <InputAdornment position="end">{endAdornment}</InputAdornment>
      ) : undefined,
    },
  };

  return (
    <TextField
      label={label}
      type={type}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth
      error={error}
      helperText={helperText}
      slotProps={slotProps}
      className="rounded-xl"
    />
  );
}

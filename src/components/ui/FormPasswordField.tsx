'use client';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import FormTextField from './FormTextField';

interface FormPasswordFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  startIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

export default function FormPasswordField({
  label,
  value,
  onChange,
  autoComplete,
  required,
  disabled,
  placeholder,
  startIcon,
  error,
  helperText,
}: FormPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormTextField
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      startIcon={startIcon}
      error={error}
      helperText={helperText}
      endAdornment={
        <IconButton
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
          edge="end"
          size="small"
          className="form-field-action text-muted"
        >
          {visible ? (
            <VisibilityOffOutlinedIcon fontSize="small" />
          ) : (
            <VisibilityOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      }
    />
  );
}

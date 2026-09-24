'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useMemo } from 'react';
import { useFormRegistry, usePlatformFormRegistry } from '@/hooks/useForms';
import { sortManageableForms } from '@/lib/forms/org-registry-forms';

interface FormModuleSelectProps {
  value: string;
  onChange: (formKey: string) => void;
  disabled?: boolean;
  scope?: 'org' | 'platform';
}

export default function FormModuleSelect({
  value,
  onChange,
  disabled = false,
  scope = 'org',
}: FormModuleSelectProps) {
  const orgRegistry = useFormRegistry();
  const platformRegistry = usePlatformFormRegistry();
  const { data, isLoading } = scope === 'platform' ? platformRegistry : orgRegistry;

  const options = useMemo(
    () => sortManageableForms(data?.forms ?? []),
    [data?.forms],
  );

  function handleChange(event: SelectChangeEvent<string>) {
    onChange(event.target.value);
  }

  return (
    <FormControl size="small" className="min-w-[220px]" disabled={disabled || isLoading}>
      <InputLabel id="form-module-select-label">Select form</InputLabel>
      <Select
        labelId="form-module-select-label"
        label="Select form"
        value={options.some((form) => form.key === value) ? value : ''}
        onChange={handleChange}
      >
        {options.map((form) => (
          <MenuItem key={form.key} value={form.key}>
            {form.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

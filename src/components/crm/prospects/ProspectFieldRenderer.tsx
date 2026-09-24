'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import LocationFieldGroup from '@/components/crm/location/LocationFieldGroup';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { normalizeMultiSelectValue } from '@/lib/crm/prospects/product-labels';
import {
  isLocationValue,
  normalizeLocationComponents,
  normalizeLocationInputMode,
  emptyLocationValue,
} from '@/lib/crm/location/types';

const BANT_COMPUTED_FIELD_HELPER =
  'Calculated from BANT qualification. Edit answers on the prospect BANT tab.';

interface ProspectFieldRendererProps {
  field: ProspectFieldDefinition;
  value: FieldStoredValue;
  onChange: (value: FieldStoredValue) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

function getStringValue(value: FieldStoredValue): string {
  if (value === null || value === undefined || Array.isArray(value)) {
    return '';
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

function getLocationValue(value: FieldStoredValue) {
  return isLocationValue(value) ? value : emptyLocationValue();
}

export default function ProspectFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: ProspectFieldRendererProps) {
  const label = field.required ? `${field.label} *` : field.label;
  const isLocked = disabled || readOnly;
  const computedHelper = readOnly ? BANT_COMPUTED_FIELD_HELPER : undefined;

  if (field.type === 'location') {
    return (
      <LocationFieldGroup
        label={field.label}
        required={field.required}
        components={normalizeLocationComponents(field.locationComponents)}
        inputMode={normalizeLocationInputMode(field.locationInputMode)}
        value={getLocationValue(value)}
        onChange={onChange}
        disabled={isLocked}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <TextField
        select
        label={label}
        value={getStringValue(value)}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        disabled={isLocked}
        helperText={computedHelper}
      >
        <MenuItem value="">
          <em>Select…</em>
        </MenuItem>
        {field.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === 'multiselect') {
    const options = field.options ?? [];
    const selectedValues = normalizeMultiSelectValue(value);

    return (
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={options}
        value={options.filter((option) => selectedValues.includes(option.value))}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(left, right) => left.value === right.value}
        onChange={(_, nextOptions) =>
          onChange(nextOptions.map((option) => option.value))
        }
        disabled={isLocked}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;

          return (
            <li key={key} {...optionProps}>
              <Checkbox checked={selected} className="mr-2" size="small" />
              {option.label}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label={label} placeholder="Select products…" />
        )}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <TextField
        label={label}
        value={getStringValue(value)}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        minRows={3}
        disabled={isLocked}
        helperText={computedHelper}
        placeholder={
          field.key === 'remarks'
            ? 'Any initial notes about this prospect...'
            : undefined
        }
      />
    );
  }

  const inputType =
    field.type === 'email'
      ? 'email'
      : field.type === 'phone'
        ? 'tel'
        : field.type === 'number'
          ? 'number'
          : field.type === 'date'
            ? 'date'
            : 'text';

  return (
    <TextField
      label={label}
      type={inputType}
      value={getStringValue(value)}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      disabled={isLocked}
      helperText={computedHelper}
      slotProps={
        readOnly
          ? { input: { readOnly: true } }
          : undefined
      }
    />
  );
}

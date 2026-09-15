'use client';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import CompanyFieldRenderer from '@/components/crm/companies/CompanyFieldRenderer';
import ProspectFieldRenderer from '@/components/crm/prospects/ProspectFieldRenderer';
import type { FormFieldDefinition } from '@/lib/forms/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface DynamicFormFieldRendererProps {
  field: FormFieldDefinition;
  value: FieldStoredValue;
  onChange: (value: FieldStoredValue) => void;
  disabled?: boolean;
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

function getBooleanValue(value: FieldStoredValue): boolean {
  return value === 'true' || value === 1;
}

function asProspectField(field: FormFieldDefinition): ProspectFieldDefinition {
  return {
    ...field,
    showInTable: field.showInTable ?? false,
    showInForm: field.showInForm ?? true,
    type: field.type as ProspectFieldDefinition['type'],
  };
}

function asCompanyField(field: FormFieldDefinition): CompanyFieldDefinition {
  return {
    ...field,
    showInTable: field.showInTable ?? false,
    showInForm: field.showInForm ?? true,
    type: field.type as CompanyFieldDefinition['type'],
  };
}

export default function DynamicFormFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
}: DynamicFormFieldRendererProps) {
  const label = field.required ? `${field.label} *` : field.label;

  if (field.type === 'company-category' || field.type === 'company-location') {
    return (
      <CompanyFieldRenderer
        field={asCompanyField(field)}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  if (
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'phone' ||
    field.type === 'textarea' ||
    field.type === 'select' ||
    field.type === 'multiselect' ||
    field.type === 'number' ||
    field.type === 'date' ||
    field.type === 'location'
  ) {
    return (
      <ProspectFieldRenderer
        field={asProspectField(field)}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  if (field.type === 'checkbox') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={getBooleanValue(value)}
            onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
            disabled={disabled}
          />
        }
        label={field.label}
      />
    );
  }

  if (field.type === 'password') {
    return (
      <TextField
        type="password"
        label={label}
        value={getStringValue(value)}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        disabled={disabled}
        placeholder={field.placeholder}
        helperText={field.helpText}
      />
    );
  }

  if (field.type === 'color') {
    return (
      <TextField
        type="color"
        label={label}
        value={getStringValue(value) || '#64748b'}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        disabled={disabled}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    );
  }

  if (field.type === 'rich-text') {
    return (
      <TextField
        label={label}
        value={getStringValue(value)}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        minRows={6}
        disabled={disabled}
      />
    );
  }

  return (
    <TextField
      label={label}
      value={getStringValue(value)}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      disabled={disabled}
      helperText={field.helpText ?? `Widget field: ${field.type}`}
    />
  );
}

'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { EmailTemplate, EmailTemplateType } from '@/lib/api';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';

export const START_FROM_SCRATCH_VALUE = '';

interface TemplateSelectFieldProps {
  type: EmailTemplateType;
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  label?: string;
  templates?: EmailTemplate[];
  isLoading?: boolean;
  includeScratchOption?: boolean;
}

export default function TemplateSelectField({
  type,
  value,
  onChange,
  disabled = false,
  label = 'Email template',
  templates: externalTemplates,
  isLoading: externalIsLoading,
  includeScratchOption = true,
}: TemplateSelectFieldProps) {
  const internalQuery = useEmailTemplates({ type });
  const templates = externalTemplates ?? internalQuery.templates;
  const isLoading = externalIsLoading ?? internalQuery.isLoading;

  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      disabled={disabled || isLoading}
      onChange={(event) => onChange(event.target.value)}
      className="min-w-[14rem] rounded-xl"
    >
      {includeScratchOption ? (
        <MenuItem value={START_FROM_SCRATCH_VALUE}>Start from scratch</MenuItem>
      ) : null}
      {templates.map((template) => (
        <MenuItem key={template.id} value={template.id}>
          {template.name}
          {template.visibility === 'private' ? ' (Private)' : ''}
        </MenuItem>
      ))}
    </TextField>
  );
}

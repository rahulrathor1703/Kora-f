'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import CompanyFieldRenderer from '@/components/crm/companies/CompanyFieldRenderer';
import CrmCreateDialogShell from '@/components/crm/fields/CrmCreateDialogShell';
import DynamicCrmFormLayout from '@/components/crm/fields/DynamicCrmFormLayout';
import {
  draftValuesToCreateInput,
  getCompanyFormFields,
  validateRequiredCompanyFields,
  type CompanyDraftValues,
} from '@/lib/crm/companies/field-config';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
  CreateCompanyInput,
} from '@/lib/crm/companies/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue } from '@/lib/crm/location/types';

interface NewCompanyDialogProps {
  open: boolean;
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

function createEmptyDraft(fields: CompanyFieldDefinition[]): CompanyDraftValues {
  const values: Record<string, FieldStoredValue> = {};

  for (const field of fields) {
    if (field.key === 'brokerName' || isSectionFieldType(field.type)) {
      continue;
    }

    values[field.key] = field.type === 'location' ? emptyLocationValue() : '';
  }

  return { brokerName: '', values };
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      className="mb-1.5 block font-semibold uppercase tracking-wide"
    >
      {children}
      {required ? ' *' : ''}
    </Typography>
  );
}

export default function NewCompanyDialog({
  open,
  fields,
  categories,
  locations,
  isSubmitting,
  onClose,
  onSubmit,
}: NewCompanyDialogProps) {
  const [draft, setDraft] = useState<CompanyDraftValues>(() =>
    createEmptyDraft(fields),
  );

  const formFields = getCompanyFormFields(fields);
  const brokerNameField = fields.find((field) => field.key === 'brokerName');

  function resetForm() {
    setDraft(createEmptyDraft(fields));
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    const validationError = validateRequiredCompanyFields(draft, fields);
    if (validationError) {
      return;
    }

    await onSubmit(draftValuesToCreateInput(draft, fields));
    resetForm();
  }

  function updateValue(key: string, value: FieldStoredValue) {
    setDraft((current) => ({
      ...current,
      values: {
        ...current.values,
        [key]: value,
      },
    }));
  }

  return (
    <CrmCreateDialogShell
      open={open}
      title="New Company"
      description="Add a new broker / company record"
      isSubmitting={isSubmitting}
      submitLabel="Create Company"
      submitDisabled={!draft.brokerName.trim()}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
    >
      <Box className="min-w-0">
        <FieldLabel required={brokerNameField?.required}>
          {brokerNameField?.label ?? 'Broker name'}
        </FieldLabel>
        <TextField
          value={draft.brokerName}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              brokerName: event.target.value,
            }))
          }
          placeholder="e.g. CoverYou Insurance Brokers"
          fullWidth
          disabled={isSubmitting}
          autoFocus
        />
      </Box>

      {formFields.length > 0 ? (
        <DynamicCrmFormLayout
          fields={formFields}
          renderField={(field) => (
            <CompanyFieldRenderer
              field={field}
              value={
                draft.values[field.key] ??
                (field.type === 'location' ? emptyLocationValue() : '')
              }
              onChange={(value) => updateValue(field.key, value)}
              disabled={isSubmitting}
              categories={categories}
              locations={locations}
              uppercaseLabel
            />
          )}
        />
      ) : null}
    </CrmCreateDialogShell>
  );
}

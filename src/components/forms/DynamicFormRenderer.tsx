'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import DynamicCrmFormLayout from '@/components/crm/fields/DynamicCrmFormLayout';
import DynamicFormFieldRenderer from '@/components/forms/DynamicFormFieldRenderer';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import {
  emptyLocationValue,
  isEmptyLocationValue,
  isLocationValue,
} from '@/lib/crm/location/types';
import type { FormFieldDefinition } from '@/lib/forms/types';

export interface DynamicFormSubmitPayload {
  values: Record<string, FieldStoredValue>;
}

interface DynamicFormRendererProps {
  fields: FormFieldDefinition[];
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onSubmit: (payload: DynamicFormSubmitPayload) => Promise<void>;
  initialValues?: Record<string, FieldStoredValue>;
  showActions?: boolean;
}

function getDefaultValue(field: FormFieldDefinition): FieldStoredValue {
  if (field.type === 'location') {
    return emptyLocationValue();
  }

  if (field.type === 'multiselect') {
    return [];
  }

  if (field.type === 'checkbox') {
    return '';
  }

  return '';
}

function serializeFieldValue(
  field: FormFieldDefinition,
  rawValue: FieldStoredValue | undefined,
): FieldStoredValue {
  if (field.type === 'location') {
    const value = isLocationValue(rawValue) ? rawValue : emptyLocationValue();
    return isEmptyLocationValue(value) ? emptyLocationValue() : value;
  }

  if (field.type === 'multiselect') {
    if (!Array.isArray(rawValue)) {
      return [];
    }

    return rawValue.map((item) => String(item).trim()).filter(Boolean);
  }

  if (field.type === 'checkbox') {
    return rawValue === 'true' || rawValue === 1 ? 'true' : 'false';
  }

  const raw = typeof rawValue === 'string' ? rawValue.trim() : '';
  if (!raw && field.type !== 'number') {
    return null;
  }

  if (field.type === 'number') {
    if (rawValue === null || rawValue === undefined || raw === '') {
      return null;
    }
    return Number(raw);
  }

  return raw || null;
}

function isFieldFilled(
  field: FormFieldDefinition,
  rawValue: FieldStoredValue | undefined,
): boolean {
  if (field.type === 'location') {
    return isLocationValue(rawValue) && !isEmptyLocationValue(rawValue);
  }

  if (field.type === 'multiselect') {
    return Array.isArray(rawValue) && rawValue.length > 0;
  }

  if (field.type === 'checkbox') {
    return true;
  }

  return typeof rawValue === 'string'
    ? rawValue.trim().length > 0
    : rawValue !== null && rawValue !== undefined;
}

export default function DynamicFormRenderer({
  fields,
  isSubmitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  onSubmit,
  initialValues = {},
  showActions = true,
}: DynamicFormRendererProps) {
  const [values, setValues] = useState<Record<string, FieldStoredValue>>(initialValues);

  const formFields = useMemo(
    () =>
      [...fields]
        .filter((field) => field.showInForm !== false)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [fields],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: Record<string, FieldStoredValue> = {};

    for (const field of formFields) {
      if (isSectionFieldType(field.type)) {
        continue;
      }

      payload[field.key] = serializeFieldValue(field, values[field.key]);
    }

    await onSubmit({ values: payload });
  }

  const canSubmit = formFields
    .filter((field) => field.required && !isSectionFieldType(field.type))
    .every((field) => isFieldFilled(field, values[field.key]));

  return (
    <Stack spacing={3} component="form" onSubmit={(event) => void handleSubmit(event)}>
      <Paper className="rounded-2xl p-4 sm:p-5">
        <DynamicCrmFormLayout
          fields={formFields}
          renderField={(field) => (
            <DynamicFormFieldRenderer
              field={field}
              value={values[field.key] ?? getDefaultValue(field)}
              onChange={(nextValue) =>
                setValues((current) => ({ ...current, [field.key]: nextValue }))
              }
              disabled={isSubmitting}
            />
          )}
        />
      </Paper>

      {showActions ? (
        <Paper className="sticky bottom-0 rounded-2xl border border-border/60 p-4">
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            {onCancel ? (
              <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                {cancelLabel}
              </Button>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !canSubmit}
            >
              {submitLabel}
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export {
  getDefaultValue as getDynamicFormDefaultValue,
  serializeFieldValue as serializeDynamicFormFieldValue,
  isFieldFilled as isDynamicFormFieldFilled,
};

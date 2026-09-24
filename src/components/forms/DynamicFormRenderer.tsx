'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { validateProspectFormValues } from '@/lib/crm/prospects/field-config';
import { isProspectBantComputedField } from '@/lib/crm/prospects/prospect-bant-computed-fields.util';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
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
  filterVisibleFields?: (
    fields: FormFieldDefinition[],
    values: Record<string, FieldStoredValue>,
  ) => FormFieldDefinition[];
  /** When set, prospect validation skips company fields for individual lead type. */
  applyProspectLeadTypeValidation?: boolean;
  renderField?: (ctx: DynamicFormRenderFieldContext) => ReactNode;
  validateExtra?: (
    values: Record<string, FieldStoredValue>,
  ) => string | null;
}

export interface DynamicFormRenderFieldContext {
  field: FormFieldDefinition;
  value: FieldStoredValue;
  onChange: (value: FieldStoredValue) => void;
  disabled: boolean;
  values: Record<string, FieldStoredValue>;
  applyValuesPatch: (patch: Record<string, FieldStoredValue>) => void;
  defaultNode: ReactNode;
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
  filterVisibleFields,
  applyProspectLeadTypeValidation = false,
  renderField,
  validateExtra,
}: DynamicFormRendererProps) {
  const { notifyError } = useNotify();
  const [values, setValues] = useState<Record<string, FieldStoredValue>>(initialValues);

  const applyValuesPatch = useCallback(
    (patch: Record<string, FieldStoredValue>) => {
      setValues((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const baseFormFields = useMemo(
    () =>
      [...fields]
        .filter((field) => field.showInForm !== false)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [fields],
  );

  const formFields = useMemo(() => {
    if (!filterVisibleFields) {
      return baseFormFields;
    }

    return filterVisibleFields(baseFormFields, values);
  }, [baseFormFields, filterVisibleFields, values]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: Record<string, FieldStoredValue> = {};

    for (const field of formFields) {
      if (isSectionFieldType(field.type)) {
        continue;
      }

      if (isProspectBantComputedField(field)) {
        continue;
      }

      payload[field.key] = serializeFieldValue(field, values[field.key]);
    }

    const prospectFields = fields as ProspectFieldDefinition[];
    const error = validateProspectFormValues(prospectFields, payload, {
      applyLeadTypeRules: applyProspectLeadTypeValidation,
      mode: 'liveCreate',
      layoutFields: applyProspectLeadTypeValidation ? prospectFields : undefined,
    });
    if (error) {
      notifyError(error);
      return;
    }

    const extraError = validateExtra?.(values) ?? null;
    if (extraError) {
      notifyError(extraError);
      return;
    }

    await onSubmit({ values: payload });
  }

  return (
    <Stack spacing={3} component="form" onSubmit={(event) => void handleSubmit(event)}>
      <Paper className="rounded-2xl p-4 sm:p-5">
        <DynamicCrmFormLayout
          fields={formFields}
          renderField={(field) => {
            const value = values[field.key] ?? getDefaultValue(field);
            const onChange = (nextValue: FieldStoredValue) =>
              setValues((current) => ({ ...current, [field.key]: nextValue }));

            const defaultNode = (
              <DynamicFormFieldRenderer
                field={field}
                value={value}
                onChange={onChange}
                disabled={isSubmitting}
              />
            );

            if (!renderField) {
              return defaultNode;
            }

            return renderField({
              field,
              value,
              onChange,
              disabled: isSubmitting,
              values,
              applyValuesPatch,
              defaultNode,
            });
          }}
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
              disabled={isSubmitting}
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

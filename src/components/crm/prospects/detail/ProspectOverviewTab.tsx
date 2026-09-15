'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import ProspectFieldRenderer from '@/components/crm/prospects/ProspectFieldRenderer';
import { renderProspectTableCell } from '@/components/crm/prospects/prospect-field-renderers';
import {
  getDetailEditableFields,
  getDetailReadOnlyFields,
} from '@/lib/crm/prospects/detail-config';
import type {
  Prospect,
  ProspectFieldDefinition,
} from '@/lib/crm/prospects/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import {
  emptyLocationValue,
  isEmptyLocationValue,
  isLocationValue,
} from '@/lib/crm/location/types';
import { normalizeMultiSelectValue } from '@/lib/crm/prospects/product-labels';

interface ProspectOverviewTabProps {
  prospect: Prospect;
  fields: ProspectFieldDefinition[];
  canUpdate: boolean;
  isSaving: boolean;
  onSave: (values: Record<string, FieldStoredValue>) => Promise<void>;
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          className="font-semibold tracking-wider"
        >
          {title}
        </Typography>
        <Box className="mt-2 border-b border-border/60" />
      </Box>
      {children}
    </Stack>
  );
}

function fieldValueToString(value: FieldStoredValue | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

function fieldValueToFormValue(
  field: ProspectFieldDefinition,
  value: FieldStoredValue | undefined,
): FieldStoredValue {
  if (field.type === 'location') {
    return isLocationValue(value) ? value : emptyLocationValue();
  }

  if (field.type === 'multiselect') {
    return normalizeMultiSelectValue(value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function serializeProspectFieldValue(
  field: ProspectFieldDefinition,
  value: FieldStoredValue,
): FieldStoredValue {
  if (field.type === 'location') {
    return isLocationValue(value) && !isEmptyLocationValue(value)
      ? value
      : emptyLocationValue();
  }

  if (field.type === 'multiselect') {
    return normalizeMultiSelectValue(value);
  }

  const raw = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  return raw.length > 0 ? raw : null;
}

function valuesEqual(
  field: ProspectFieldDefinition,
  left: FieldStoredValue,
  right: FieldStoredValue | undefined,
): boolean {
  if (field.type === 'location') {
    const leftValue = isLocationValue(left) ? left : emptyLocationValue();
    const rightValue = isLocationValue(right) ? right : emptyLocationValue();
    return JSON.stringify(leftValue) === JSON.stringify(rightValue);
  }

  if (field.type === 'multiselect') {
    return (
      JSON.stringify(normalizeMultiSelectValue(left)) ===
      JSON.stringify(normalizeMultiSelectValue(right))
    );
  }

  return String(left ?? '') === String(right ?? '');
}

export default function ProspectOverviewTab({
  prospect,
  fields,
  canUpdate,
  isSaving,
  onSave,
}: ProspectOverviewTabProps) {
  const readOnlyFields = useMemo(
    () => getDetailReadOnlyFields(fields),
    [fields],
  );

  const editableFields = useMemo(
    () => getDetailEditableFields(fields),
    [fields],
  );

  const editableFieldKeys = useMemo(
    () => editableFields.map((field) => field.key),
    [editableFields],
  );

  const prospectValues = useMemo<Record<string, FieldStoredValue>>(
    () => ({
      ...prospect.values,
      fullName: prospect.fullName,
      email: prospect.email,
    }),
    [prospect],
  );

  const [formValues, setFormValues] = useState<Record<string, FieldStoredValue>>(() =>
    Object.fromEntries(
      editableFieldKeys.map((key) => {
        const field = editableFields.find((item) => item.key === key);
        return [
          key,
          field
            ? fieldValueToFormValue(field, prospectValues[key])
            : fieldValueToString(prospectValues[key]),
        ];
      }),
    ),
  );

  const isDirty = useMemo(
    () =>
      editableFieldKeys.some((key) => {
        const field = editableFields.find((item) => item.key === key);
        if (!field) {
          return false;
        }

        return !valuesEqual(field, formValues[key], prospectValues[key]);
      }),
    [editableFieldKeys, editableFields, formValues, prospectValues],
  );

  async function handleSave() {
    const values: Record<string, FieldStoredValue> = {};

    for (const field of editableFields) {
      values[field.key] = serializeProspectFieldValue(
        field,
        formValues[field.key],
      );
    }

    await onSave(values);
  }

  return (
    <Stack spacing={4}>
      {readOnlyFields.length > 0 ? (
        <DetailSection title="Details">
          <Box className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {readOnlyFields.map((field) => (
              <Stack key={field.key} spacing={0.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="font-semibold uppercase tracking-wide"
                >
                  {field.label}
                </Typography>
                <Box>{renderProspectTableCell(field, prospectValues)}</Box>
              </Stack>
            ))}
          </Box>
        </DetailSection>
      ) : null}

      {editableFields.length > 0 ? (
        <DetailSection title="Editable fields">
          <Box className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {editableFields.map((field) => (
              <Box
                key={field.key}
                className={
                  field.type === 'textarea' ||
                  field.type === 'location' ||
                  field.type === 'multiselect'
                    ? 'sm:col-span-2'
                    : undefined
                }
              >
                <ProspectFieldRenderer
                  field={field}
                  value={
                    formValues[field.key] ??
                    fieldValueToFormValue(field, undefined)
                  }
                  onChange={(value) =>
                    setFormValues((current) => ({ ...current, [field.key]: value }))
                  }
                  disabled={!canUpdate || isSaving}
                />
              </Box>
            ))}
          </Box>

          {canUpdate ? (
            <Box className="pt-1">
              <Button
                variant="contained"
                onClick={() => void handleSave()}
                disabled={!isDirty || isSaving}
                className="rounded-xl px-5 font-semibold"
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </Box>
          ) : null}
        </DetailSection>
      ) : null}
    </Stack>
  );
}

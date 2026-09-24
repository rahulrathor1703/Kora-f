'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import DynamicCrmFormLayout from '@/components/crm/fields/DynamicCrmFormLayout';
import ProspectOverviewField from '@/components/crm/prospects/detail/ProspectOverviewField';
import { serializeDynamicFormFieldValue } from '@/components/forms/DynamicFormRenderer';
import { useNotify } from '@/hooks/useNotify';
import { validateProspectFormValues } from '@/lib/crm/prospects/field-config';
import {
  getProspectOverviewLayoutFields,
  getProspectOverviewFooterFields,
  isProspectFieldEditableOnDetail,
} from '@/lib/crm/prospects/prospect-detail-fields.util';
import type {
  Prospect,
  ProspectFieldDefinition,
} from '@/lib/crm/prospects/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue, isLocationValue } from '@/lib/crm/location/types';
import { normalizeMultiSelectValue } from '@/lib/crm/prospects/product-labels';

interface ProspectOverviewTabProps {
  prospect: Prospect;
  fields: ProspectFieldDefinition[];
  canUpdate: boolean;
  isSaving: boolean;
  onSave: (values: Record<string, FieldStoredValue>) => Promise<void>;
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

function getEditableOverviewFields(
  fields: ProspectFieldDefinition[],
  layoutFields: ProspectFieldDefinition[],
  summaryFields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const keys = new Set<string>();

  for (const field of [...summaryFields, ...layoutFields]) {
    if (isProspectFieldEditableOnDetail(field)) {
      keys.add(field.key);
    }
  }

  return [...keys]
    .map((key) => byKey.get(key))
    .filter((field): field is ProspectFieldDefinition => Boolean(field));
}

export default function ProspectOverviewTab({
  prospect,
  fields,
  canUpdate,
  isSaving,
  onSave,
}: ProspectOverviewTabProps) {
  const { notifyError } = useNotify();

  const prospectValues = useMemo<Record<string, FieldStoredValue>>(
    () => ({
      ...prospect.values,
      fullName: prospect.fullName,
      email: prospect.email,
    }),
    [prospect],
  );

  const [draftValues, setDraftValues] = useState<Record<
    string,
    FieldStoredValue
  > | null>(null);
  const [isGlobalEdit, setIsGlobalEdit] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

  const activeValues = draftValues ?? prospectValues;

  const layoutFields = useMemo(
    () => getProspectOverviewLayoutFields(fields, activeValues),
    [fields, activeValues],
  );

  const footerFields = useMemo(
    () => getProspectOverviewFooterFields(fields, layoutFields),
    [fields, layoutFields],
  );

  const editableFields = useMemo(
    () => getEditableOverviewFields(fields, layoutFields, footerFields),
    [fields, layoutFields, footerFields],
  );

  const displayValues = useMemo(
    () => ({ ...prospectValues, ...activeValues }),
    [prospectValues, activeValues],
  );

  const isEditing = isGlobalEdit || editingFieldKey !== null;

  function clearEditState() {
    setDraftValues(null);
    setIsGlobalEdit(false);
    setEditingFieldKey(null);
  }

  function startDraftFromProspect() {
    const next: Record<string, FieldStoredValue> = {};
    for (const field of editableFields) {
      next[field.key] = fieldValueToFormValue(field, prospectValues[field.key]);
    }
    setDraftValues(next);
  }

  function handleStartGlobalEdit() {
    startDraftFromProspect();
    setEditingFieldKey(null);
    setIsGlobalEdit(true);
  }

  function handleStartFieldEdit(fieldKey: string) {
    startDraftFromProspect();
    setIsGlobalEdit(false);
    setEditingFieldKey(fieldKey);
  }

  function handleCancelEdit() {
    clearEditState();
  }

  function handleChange(fieldKey: string, value: FieldStoredValue) {
    setDraftValues((current) => {
      const source = current ?? {};
      return { ...source, [fieldKey]: value };
    });
  }

  function buildSavePayload(
    keys: string[],
    valuesSource: Record<string, FieldStoredValue>,
  ): Record<string, FieldStoredValue> {
    const payload: Record<string, FieldStoredValue> = {};

    for (const key of keys) {
      const field = fields.find((item) => item.key === key);
      if (!field) {
        continue;
      }

      payload[key] = serializeDynamicFormFieldValue(
        field,
        valuesSource[key],
      );
    }

    return payload;
  }

  async function persistValues(payload: Record<string, FieldStoredValue>) {
    const mergedForValidation = {
      ...prospectValues,
      ...payload,
    };

    const validationError = validateProspectFormValues(fields, mergedForValidation, {
      applyLeadTypeRules: true,
      mode: 'full',
      layoutFields: fields,
    });

    if (validationError) {
      notifyError(validationError);
      return;
    }

    await onSave(payload);
    clearEditState();
  }

  async function handleSaveField(fieldKey: string) {
    if (!draftValues) {
      return;
    }

    await persistValues(buildSavePayload([fieldKey], draftValues));
  }

  async function handleSaveAll() {
    if (!draftValues) {
      return;
    }

    const keys = editableFields.map((field) => field.key);
    await persistValues(buildSavePayload(keys, draftValues));
  }

  function getFieldValue(field: ProspectFieldDefinition): FieldStoredValue {
    if (draftValues && field.key in draftValues) {
      return draftValues[field.key];
    }

    return fieldValueToFormValue(field, prospectValues[field.key]);
  }

  function renderOverviewField(field: ProspectFieldDefinition) {
    const fieldIsEditing =
      isGlobalEdit || editingFieldKey === field.key;

    return (
      <ProspectOverviewField
        key={field.id}
        field={field}
        value={getFieldValue(field)}
        prospectValues={displayValues}
        isEditing={fieldIsEditing}
        isGlobalEdit={isGlobalEdit}
        canUpdate={canUpdate}
        isSaving={isSaving}
        onStartEdit={handleStartFieldEdit}
        onCancelEdit={handleCancelEdit}
        onSaveField={(key) => void handleSaveField(key)}
        onChange={handleChange}
      />
    );
  }

  return (
    <Stack spacing={4}>
      {canUpdate ? (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          {isGlobalEdit ? (
            <>
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => void handleSaveAll()}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save all'}
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={handleStartGlobalEdit}
              disabled={isEditing || editableFields.length === 0}
            >
              Edit
            </Button>
          )}
        </Stack>
      ) : null}

      {layoutFields.length > 0 ? (
        <DynamicCrmFormLayout
          fields={layoutFields}
          renderField={renderOverviewField}
        />
      ) : null}

      {footerFields.length > 0 ? (
        <Box className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {footerFields.map((field) => (
            <Box key={field.id}>{renderOverviewField(field)}</Box>
          ))}
        </Box>
      ) : null}
    </Stack>
  );
}

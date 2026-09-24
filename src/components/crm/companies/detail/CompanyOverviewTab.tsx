'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import CompanyOverviewField from '@/components/crm/companies/detail/CompanyOverviewField';
import DynamicCrmFormLayout from '@/components/crm/fields/DynamicCrmFormLayout';
import { useNotify } from '@/hooks/useNotify';
import {
  getCompanyOverviewDataFields,
  getCompanyOverviewLayoutFields,
  isCompanyFieldEditableOnDetail,
} from '@/lib/crm/companies/company-detail-fields.util';
import {
  companyToDraftValues,
  draftValuesToUpdateInput,
  validateCompanyFormValues,
  type CompanyDraftValues,
} from '@/lib/crm/companies/field-config';
import type {
  Company,
  CompanyConfigOption,
  CompanyFieldDefinition,
} from '@/lib/crm/companies/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue, isLocationValue } from '@/lib/crm/location/types';

interface CompanyOverviewTabProps {
  company: Company;
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  canUpdate: boolean;
  isSaving: boolean;
  onSave: (input: ReturnType<typeof draftValuesToUpdateInput>) => Promise<void>;
}

function fieldValueToFormValue(
  field: CompanyFieldDefinition,
  draft: CompanyDraftValues,
): FieldStoredValue {
  if (field.type === 'location') {
    const value = draft.values[field.key];
    return isLocationValue(value) ? value : emptyLocationValue();
  }

  const value = draft.values[field.key];
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

export default function CompanyOverviewTab({
  company,
  fields,
  categories,
  locations,
  canUpdate,
  isSaving,
  onSave,
}: CompanyOverviewTabProps) {
  const { notifyError } = useNotify();

  const baseValues = useMemo(
    () => companyToDraftValues(company),
    [company],
  );

  const layoutFields = useMemo(
    () => getCompanyOverviewLayoutFields(fields),
    [fields],
  );

  const editableFields = useMemo(() => {
    const dataFields = getCompanyOverviewDataFields(layoutFields);
    return dataFields.filter((field) => isCompanyFieldEditableOnDetail(field));
  }, [layoutFields]);

  const [draftValues, setDraftValues] = useState<CompanyDraftValues | null>(null);
  const [isGlobalEdit, setIsGlobalEdit] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

  const formValues = draftValues ?? baseValues;
  const isEditing = isGlobalEdit || editingFieldKey !== null;

  function clearEditState() {
    setDraftValues(null);
    setIsGlobalEdit(false);
    setEditingFieldKey(null);
  }

  function startDraftFromCompany() {
    setDraftValues({
      brokerName: baseValues.brokerName,
      values: { ...baseValues.values },
    });
  }

  function handleStartGlobalEdit() {
    startDraftFromCompany();
    setEditingFieldKey(null);
    setIsGlobalEdit(true);
  }

  function handleStartFieldEdit(fieldKey: string) {
    startDraftFromCompany();
    setIsGlobalEdit(false);
    setEditingFieldKey(fieldKey);
  }

  function handleCancelEdit() {
    clearEditState();
  }

  function handleChange(fieldKey: string, value: FieldStoredValue) {
    setDraftValues((current) => {
      const source = current ?? baseValues;

      return {
        ...source,
        values: { ...source.values, [fieldKey]: value },
      };
    });
  }

  async function persistFieldKeys(keys: string[]) {
    if (!draftValues) {
      return;
    }

    const validationError = validateCompanyFormValues(fields, draftValues, {
      mode: 'full',
      categories,
      locations,
    });
    if (validationError) {
      notifyError(validationError);
      return;
    }

    if (keys.length === 1) {
      await onSave(draftValuesToUpdateInput(draftValues, fields, keys[0]));
    } else {
      await onSave(draftValuesToUpdateInput(draftValues, fields));
    }

    clearEditState();
  }

  function getFieldValue(field: CompanyFieldDefinition): FieldStoredValue {
    return fieldValueToFormValue(field, formValues);
  }

  function renderOverviewField(field: CompanyFieldDefinition) {
    const fieldIsEditing =
      isGlobalEdit || editingFieldKey === field.key;

    return (
      <CompanyOverviewField
        key={field.id}
        field={field}
        value={getFieldValue(field)}
        isEditing={fieldIsEditing}
        isGlobalEdit={isGlobalEdit}
        canUpdate={canUpdate}
        isSaving={isSaving}
        categories={categories}
        locations={locations}
        onStartEdit={handleStartFieldEdit}
        onCancelEdit={handleCancelEdit}
        onSaveField={(key) => void persistFieldKeys([key])}
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
                onClick={() =>
                  void persistFieldKeys(editableFields.map((field) => field.key))
                }
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
      ) : (
        <Box className="text-sm text-muted-foreground">
          No company fields are configured on the form layout yet.
        </Box>
      )}
    </Stack>
  );
}

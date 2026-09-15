'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { renderCompanyDisplayValue } from '@/components/crm/companies/company-field-renderers';
import CompanyDetailHeader from '@/components/crm/companies/detail/CompanyDetailHeader';
import CompanyEditableField from '@/components/crm/companies/detail/CompanyEditableField';
import {
  useCompany,
  useCompanyFieldSchema,
  useCompanyMutations,
} from '@/hooks/useCompanies';
import { useCompanyConfigOptions } from '@/hooks/useCompanyConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import {
  BROKER_NAME_FIELD_KEY,
  type CompanyFieldDefinition,
} from '@/lib/crm/companies/types';
import {
  companyToDraftValues,
  draftValuesToUpdateInput,
  formatCompanyFieldDisplayValue,
  getCompanyDetailFields,
  validateRequiredCompanyFields,
  type CompanyDraftValues,
} from '@/lib/crm/companies/field-config';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue } from '@/lib/crm/location/types';

interface CompanyDetailContentProps {
  companyId: string;
}

function getFieldValue(
  draft: CompanyDraftValues,
  field: CompanyFieldDefinition,
): FieldStoredValue {
  if (field.key === BROKER_NAME_FIELD_KEY) {
    return draft.brokerName;
  }

  return draft.values[field.key] ?? (field.type === 'location' ? emptyLocationValue() : '');
}

export default function CompanyDetailContent({
  companyId,
}: CompanyDetailContentProps) {
  const { notifyError, notifySuccess } = useNotify();
  const canUpdate = useHasPermission('companies:update');
  const { data: company, error, isLoading, refetch } = useCompany(companyId);
  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useCompanyFieldSchema();
  const { options: categories } = useCompanyConfigOptions('category');
  const { options: locations } = useCompanyConfigOptions('location');
  const { updateCompany, isUpdating } = useCompanyMutations();

  const [draftValues, setDraftValues] = useState<CompanyDraftValues | null>(null);
  const [isGlobalEdit, setIsGlobalEdit] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

  const fields = useMemo(() => fieldSchema?.fields ?? [], [fieldSchema]);
  const detailFields = useMemo(
    () => getCompanyDetailFields(fields),
    [fields],
  );

  const baseValues = useMemo(
    () => (company ? companyToDraftValues(company) : null),
    [company],
  );

  const isEditing = isGlobalEdit || editingFieldKey !== null;
  const formValues = draftValues ?? baseValues;

  const configOptions = useMemo(
    () => ({ categories, locations }),
    [categories, locations],
  );

  function clearEditState() {
    setDraftValues(null);
    setIsGlobalEdit(false);
    setEditingFieldKey(null);
  }

  function handleChange(fieldKey: string, value: FieldStoredValue) {
    setDraftValues((current) => {
      const source = current ?? baseValues;
      if (!source) {
        return current;
      }

      if (fieldKey === BROKER_NAME_FIELD_KEY) {
        return { ...source, brokerName: String(value) };
      }

      return {
        ...source,
        values: { ...source.values, [fieldKey]: value },
      };
    });
  }

  function handleStartGlobalEdit() {
    if (!baseValues) {
      return;
    }

    setDraftValues({ ...baseValues, values: { ...baseValues.values } });
    setEditingFieldKey(null);
    setIsGlobalEdit(true);
  }

  function handleStartFieldEdit(fieldKey: string) {
    if (!baseValues) {
      return;
    }

    setDraftValues({ ...baseValues, values: { ...baseValues.values } });
    setIsGlobalEdit(false);
    setEditingFieldKey(fieldKey);
  }

  function handleCancelEdit() {
    clearEditState();
  }

  async function handleSaveField(fieldKey: string) {
    if (!formValues) {
      return;
    }

    const validationError = validateRequiredCompanyFields(formValues, fields);
    if (validationError && fieldKey === BROKER_NAME_FIELD_KEY) {
      notifyError(validationError);
      return;
    }

    try {
      await updateCompany(
        companyId,
        draftValuesToUpdateInput(formValues, fields, fieldKey),
      );
      await refetch();
      notifySuccess('Company updated');
      clearEditState();
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Failed to save company'));
    }
  }

  async function handleSaveAll() {
    if (!formValues) {
      return;
    }

    const validationError = validateRequiredCompanyFields(formValues, fields);
    if (validationError) {
      notifyError(validationError);
      return;
    }

    try {
      await updateCompany(
        companyId,
        draftValuesToUpdateInput(formValues, fields),
      );
      await refetch();
      notifySuccess('Company updated');
      clearEditState();
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Failed to save company'));
    }
  }

  if (error && !isLoading) {
    return (
      <Stack spacing={3}>
        <CompanyDetailHeader
          company={null}
          categories={categories}
          locations={locations}
          isLoading={false}
        />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              Company not found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              This company may have been removed or you may not have access to
              view it.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <CompanyDetailHeader
          company={company ?? null}
          categories={categories}
          locations={locations}
          isLoading={isLoading || isSchemaLoading}
        />
        {canUpdate && company && !isLoading ? (
          <Stack direction="row" spacing={1}>
            {isGlobalEdit ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSaveAll()}
                  disabled={isUpdating}
                >
                  Save all
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={handleStartGlobalEdit}
                disabled={isEditing}
              >
                Edit
              </Button>
            )}
          </Stack>
        ) : null}
      </Stack>

      {company && formValues ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-5 md:p-6">
            <Box className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {detailFields.map((field) => (
                <Box
                  key={field.id}
                  className={
                    field.type === 'textarea' || field.type === 'location'
                      ? 'sm:col-span-2'
                      : undefined
                  }
                >
                  <CompanyEditableField
                    field={field}
                    value={getFieldValue(formValues, field)}
                    displayValue={
                      field.type === 'location'
                        ? formatCompanyFieldDisplayValue(
                            field,
                            getFieldValue(formValues, field),
                          ) || '—'
                        : renderCompanyDisplayValue(
                            field,
                            getFieldValue(formValues, field) as
                              | string
                              | number
                              | null,
                            configOptions,
                          )
                    }
                    isEditing={isGlobalEdit || editingFieldKey === field.key}
                    isGlobalEdit={isGlobalEdit}
                    canUpdate={canUpdate}
                    isSaving={isUpdating}
                    categories={categories}
                    locations={locations}
                    onStartEdit={handleStartFieldEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveField={(key) => void handleSaveField(key)}
                    onChange={handleChange}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : isLoading || isSchemaLoading ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-6">
            <Typography variant="body2" color="text.secondary">
              Loading company details…
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

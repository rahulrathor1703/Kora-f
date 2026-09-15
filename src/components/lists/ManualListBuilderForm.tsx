'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import CrmProspectSyncToggle from '@/components/email/campaigns/create/CrmProspectSyncToggle';
import ManualListProspectPicker from '@/components/lists/ManualListProspectPicker';
import ManualListSpreadsheet from '@/components/lists/ManualListSpreadsheet';
import { FormTextField, SubmitButton } from '@/components/ui';
import { useFormSchema } from '@/hooks/useForms';
import { useManualLists } from '@/hooks/useManualLists';
import { getApiErrorMessage } from '@/lib/api';
import { resolveManualListColumnKeys } from '@/lib/lists/column-utils';
import {
  buildManualListCreatePayload,
  detectManualListProspectFieldMapping,
} from '@/lib/lists/manual-list-payload';
import type { ProspectSyncResult } from '@/lib/lists/types';
import {
  MANUAL_LIST_BUILDER_DEFAULT_VALUES,
  manualListBuilderSchema,
  type ManualListBuilderFormValues,
} from '@/lib/schemas/manual-list';

const MANUAL_LIST_IMPORT_FORM_KEY = 'email.list.manual.import';

export interface ManualListBuilderSuccessResult {
  type: 'manual';
  id: string;
  name: string;
  count: number;
  prospectSync?: ProspectSyncResult;
}

interface ManualListBuilderFormProps {
  embedded?: boolean;
  syncToProspects: boolean;
  onSyncToProspectsChange: (value: boolean) => void;
  showCrmToggle: boolean;
  showProspectPicker?: boolean;
  onCancel: () => void;
  onSuccess: (result: ManualListBuilderSuccessResult) => void;
}

interface ManualListBuilderFormBodyProps extends ManualListBuilderFormProps {
  initialValues: ManualListBuilderFormValues;
}

function ManualListBuilderFormBody({
  embedded = false,
  syncToProspects,
  onSyncToProspectsChange,
  showCrmToggle,
  showProspectPicker = false,
  onCancel,
  onSuccess,
  initialValues,
}: ManualListBuilderFormBodyProps) {
  const { createList } = useManualLists();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ManualListBuilderFormValues>({
    resolver: zodResolver(manualListBuilderSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const rawColumns = useWatch({ control: form.control, name: 'columns' });

  const prospectFieldMapping = useMemo(() => {
    const columns = rawColumns ?? [];
    const resolvedColumns = resolveManualListColumnKeys(
      columns.map((column) => column.label),
    );

    return detectManualListProspectFieldMapping(
      columns.map((column, index) => ({
        label: column.label,
        key: resolvedColumns[index]?.key,
      })),
    );
  }, [rawColumns]);

  const crmToggleDisabled = !prospectFieldMapping;
  const crmToggleDisabledReason =
    'Add a column labeled Email before syncing to CRM Prospects.';

  async function handleSubmit(values: ManualListBuilderFormValues) {
    setSaveError(null);
    setIsSaving(true);

    try {
      const payload = buildManualListCreatePayload(values, {
        syncToProspects: syncToProspects && Boolean(prospectFieldMapping),
        prospectFieldMapping: prospectFieldMapping ?? undefined,
      });
      const result = await createList(payload);

      onSuccess({
        type: 'manual',
        id: result.id,
        name: result.name,
        count: result.rowCount,
        prospectSync: result.prospectSync,
      });
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Failed to create list'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormProvider {...form}>
      <Box
        component="form"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Stack spacing={embedded ? 2.5 : 3}>
          {saveError ? (
            <Alert severity="error" className="rounded-2xl">
              {saveError}
            </Alert>
          ) : null}

          <FormTextField name="name" control={form.control} label="List name" />

          {showProspectPicker ? <ManualListProspectPicker /> : null}

          <ManualListSpreadsheet embedded={embedded} />

          {showCrmToggle ? (
            <Box className="rounded-xl border border-surface-border px-3 py-2.5">
              <CrmProspectSyncToggle
                checked={syncToProspects}
                onChange={onSyncToProspectsChange}
                disabled={crmToggleDisabled}
                disabledReason={crmToggleDisabledReason}
              />
            </Box>
          ) : null}

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              className="rounded-2xl px-5 py-2.5"
            >
              Cancel
            </Button>
            <SubmitButton
              type="submit"
              label="Create list"
              loading={isSaving}
            />
          </Stack>
        </Stack>
      </Box>
    </FormProvider>
  );
}

export default function ManualListBuilderForm(props: ManualListBuilderFormProps) {
  const { data: importSchema, isLoading } = useFormSchema(MANUAL_LIST_IMPORT_FORM_KEY);

  const initialValues = useMemo(() => {
    const orgColumns = importSchema?.tableColumns ?? [];
    if (orgColumns.length === 0) {
      return MANUAL_LIST_BUILDER_DEFAULT_VALUES;
    }

    return {
      ...MANUAL_LIST_BUILDER_DEFAULT_VALUES,
      columns: orgColumns.map((column) => ({ label: column.label })),
    };
  }, [importSchema?.tableColumns]);

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading list column settings...
      </Typography>
    );
  }

  return (
    <ManualListBuilderFormBody
      key={`manual-list-builder-${importSchema?.version ?? 0}-${initialValues.columns.length}`}
      {...props}
      initialValues={initialValues}
    />
  );
}

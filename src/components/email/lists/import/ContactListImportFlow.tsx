'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import {
  FormProvider,
  useForm,
  useWatch,
  type FieldErrors,
} from 'react-hook-form';
import CrmProspectSyncToggle from '@/components/email/campaigns/create/CrmProspectSyncToggle';
import ListImportStepper from '@/components/email/lists/import/ListImportStepper';
import ListColumnMappingStep from '@/components/email/lists/import/steps/ListColumnMappingStep';
import ReviewStep from '@/components/email/lists/import/steps/ReviewStep';
import UploadStep from '@/components/email/lists/import/steps/UploadStep';
import { useContactLists } from '@/hooks/useContactLists';
import { useFormSchema } from '@/hooks/useForms';
import { useNotify } from '@/hooks/useNotify';
import { contactListService, getApiErrorMessage } from '@/lib/api';
import { buildMappingsFromTableColumns } from '@/lib/email/lists/list-column-mapping-utils';
import { buildContactListFieldMappingPayload } from '@/lib/email/lists/import-utils';
import type {
  ContactListImportPreview,
  ProspectSyncResult,
} from '@/lib/email/lists/types';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import {
  LIST_IMPORT_WIZARD_DEFAULT_VALUES,
  LIST_IMPORT_WIZARD_STEPS,
  createListImportWizardSchema,
  listImportStep1Schema,
  type ListImportWizardFormValues,
} from '@/lib/schemas/contact-list-import';
import { toListColumnMappingTargets } from '@/lib/schemas/list-column-mapping';

const CONTACT_LIST_IMPORT_FORM_KEY = 'email.list.contact.import';

export interface ContactListImportSuccessResult {
  type: 'contact';
  id: string;
  name: string;
  count: number;
  prospectSync?: ProspectSyncResult;
}

interface ContactListImportFlowProps {
  embedded?: boolean;
  syncToProspects: boolean;
  onSyncToProspectsChange: (value: boolean) => void;
  showCrmToggle: boolean;
  onCancel: () => void;
  onSuccess: (result: ContactListImportSuccessResult) => void;
}

interface ContactListImportFlowLoadedProps extends ContactListImportFlowProps {
  tableColumns: FormTableColumnDefinition[];
}

function resolveImportFormError(
  errors: FieldErrors<ListImportWizardFormValues>,
): string {
  if (errors.name?.message) {
    return String(errors.name.message);
  }

  const columnMappingsError = errors.columnMappings;

  if (Array.isArray(columnMappingsError)) {
    for (const rowError of columnMappingsError) {
      if (rowError?.sourceColumn?.message) {
        return String(rowError.sourceColumn.message);
      }
    }
  }

  if (
    columnMappingsError &&
    typeof columnMappingsError === 'object' &&
    'message' in columnMappingsError &&
    columnMappingsError.message
  ) {
    return String(columnMappingsError.message);
  }

  return 'Complete all required fields before continuing.';
}

export default function ContactListImportFlow(props: ContactListImportFlowProps) {
  const { data: importSchema, isLoading: isSchemaLoading } = useFormSchema(
    CONTACT_LIST_IMPORT_FORM_KEY,
  );
  const tableColumns = useMemo(
    () => importSchema?.tableColumns ?? [],
    [importSchema?.tableColumns],
  );

  if (isSchemaLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading import column settings...
      </Typography>
    );
  }

  if (tableColumns.length === 0) {
    return (
      <Alert severity="warning" className="rounded-2xl">
        No import columns are configured. Ask an admin to set up table columns
        in Manage Forms before importing a contact list.
      </Alert>
    );
  }

  return <ContactListImportFlowLoaded {...props} tableColumns={tableColumns} />;
}

function ContactListImportFlowLoaded({
  embedded = false,
  syncToProspects,
  onSyncToProspectsChange,
  showCrmToggle,
  onCancel,
  onSuccess,
  tableColumns,
}: ContactListImportFlowLoadedProps) {
  const { notify } = useNotify();
  const { importList } = useContactLists();
  const targetColumns = useMemo(
    () => toListColumnMappingTargets(tableColumns),
    [tableColumns],
  );

  const wizardSchema = useMemo(
    () => createListImportWizardSchema(tableColumns),
    [tableColumns],
  );

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ContactListImportPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ListImportWizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: LIST_IMPORT_WIZARD_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const activeStep = LIST_IMPORT_WIZARD_STEPS[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === LIST_IMPORT_WIZARD_STEPS.length - 1;

  async function handleFileSelect(file: File) {
    setSaveError(null);

    const isNameValid = await form.trigger('name');
    if (!isNameValid) {
      notify('Please enter a list name before uploading your file.', {
        variant: 'warning',
      });
      setSaveError(resolveImportFormError(form.formState.errors));
      return;
    }

    setSelectedFile(file);
    setIsPreviewLoading(true);

    try {
      const previewResult = await contactListService.previewImport(file);
      setPreview(previewResult);

      form.setValue(
        'columnMappings',
        buildMappingsFromTableColumns(tableColumns, previewResult.columns),
      );

      if (activeStepIndex === 0) {
        setActiveStepIndex(1);
      }
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to preview file'));
      setPreview(null);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleNext() {
    setSaveError(null);

    if (isFirstStep) {
      const isValid = await form.trigger(['name']);

      if (!isValid) {
        setSaveError(resolveImportFormError(form.formState.errors));
        return;
      }

      if (!selectedFile || !preview) {
        setSaveError('Upload a file to continue.');
        return;
      }

      setActiveStepIndex(1);
      return;
    }

    if (activeStep.id === 'mapping') {
      const isValid = await form.trigger(['name', 'columnMappings']);

      if (!isValid) {
        setSaveError(resolveImportFormError(form.formState.errors));
        return;
      }

      setActiveStepIndex(2);
    }
  }

  function handleBack() {
    setSaveError(null);
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  async function handleImport() {
    setSaveError(null);

    if (!selectedFile || !preview) {
      setSaveError('Upload a file before importing.');
      return;
    }

    const isValid = await form.trigger();

    if (!isValid) {
      setSaveError(resolveImportFormError(form.formState.errors));
      return;
    }

    setIsSaving(true);

    try {
      const values = form.getValues();
      const result = await importList(selectedFile, {
        name: values.name.trim(),
        fieldMapping: buildContactListFieldMappingPayload(values, tableColumns),
        syncToProspects,
      });

      onSuccess({
        type: 'contact',
        id: result.list.id,
        name: result.list.name,
        count: result.importedCount,
        prospectSync: result.prospectSync,
      });
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to import list'));
    } finally {
      setIsSaving(false);
    }
  }

  const watchedName = useWatch({ control: form.control, name: 'name' }) ?? '';

  const step1Valid = listImportStep1Schema.safeParse({
    name: watchedName,
  }).success;

  return (
    <Stack
      spacing={embedded ? 2.5 : 4}
      sx={
        embedded
          ? { flex: 1, minHeight: 0, overflow: 'hidden' }
          : undefined
      }
    >
      <ListImportStepper activeStepIndex={activeStepIndex} />

      <Box
        sx={
          embedded
            ? { flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }
            : undefined
        }
      >
        <FormProvider {...form}>
          {activeStep.id === 'upload' ? (
            <UploadStep
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              isPreviewLoading={isPreviewLoading}
            />
          ) : null}

          {activeStep.id === 'mapping' && preview ? (
            <ListColumnMappingStep
              targetColumns={targetColumns}
              fileColumns={preview.columns}
            />
          ) : null}

          {activeStep.id === 'review' && preview && selectedFile ? (
            <Stack spacing={2.5}>
              <ReviewStep
                preview={preview}
                selectedFile={selectedFile}
                values={form.getValues()}
                targetColumns={targetColumns}
              />
              {showCrmToggle ? (
                <Box className="rounded-2xl border border-border bg-surface px-4 py-3">
                  <CrmProspectSyncToggle
                    checked={syncToProspects}
                    onChange={onSyncToProspectsChange}
                  />
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </FormProvider>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          ...(embedded
            ? {
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                pt: 2,
              }
            : {
                position: 'sticky',
                bottom: 0,
                zIndex: 2,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                pt: 2,
              }),
        }}
      >
        {saveError ? (
          <Alert severity="error" className="mb-2 rounded-xl">
            {saveError}
          </Alert>
        ) : null}

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between' }}
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={isFirstStep ? onCancel : handleBack}
            className="rounded-xl"
          >
            {isFirstStep ? 'Cancel' : 'Back'}
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              variant="contained"
              onClick={() => void handleImport()}
              disabled={isSaving}
              className="rounded-xl px-5 shadow-primary-soft"
            >
              {isSaving ? 'Creating...' : 'Create list'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => void handleNext()}
              disabled={
                isFirstStep
                  ? !step1Valid || !selectedFile || isPreviewLoading
                  : false
              }
              className="rounded-xl px-5 shadow-primary-soft"
            >
              {activeStep.id === 'upload'
                ? 'Next: Match columns →'
                : 'Next: Review →'}
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

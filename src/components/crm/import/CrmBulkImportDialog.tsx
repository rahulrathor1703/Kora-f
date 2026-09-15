'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import CrmImportMapFieldsStep from '@/components/crm/import/CrmImportMapFieldsStep';
import CrmImportReviewStep from '@/components/crm/import/CrmImportReviewStep';
import CrmImportStepper from '@/components/crm/import/CrmImportStepper';
import CrmImportUploadStep from '@/components/crm/import/CrmImportUploadStep';
import { useCompanyFieldSchema } from '@/hooks/useCompanies';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useProspectFieldSchema } from '@/hooks/useProspects';
import {
  companiesService,
  getApiErrorMessage,
} from '@/lib/api';
import { prospectsService } from '@/lib/api/services/prospects.service';
import { applySuggestedFieldMapping } from '@/lib/crm/import/template-utils';
import type {
  CrmImportEntityType,
  CrmImportPreview,
  CrmImportResult,
} from '@/lib/crm/import/types';
import {
  buildCrmImportFieldMappingPayload,
  CRM_IMPORT_WIZARD_DEFAULT_VALUES,
  CRM_IMPORT_WIZARD_STEPS,
  crmImportWizardSchema,
  validateRequiredFieldMappings,
  type CrmImportWizardFormValues,
} from '@/lib/schemas/crm-import';

interface CrmBulkImportDialogProps {
  open: boolean;
  defaultEntityType: CrmImportEntityType;
  onClose: () => void;
  onSuccess: () => void;
}

interface CrmBulkImportDialogContentProps {
  defaultEntityType: CrmImportEntityType;
  onClose: () => void;
  onSuccess: () => void;
}

function CrmBulkImportDialogContent({
  defaultEntityType,
  onClose,
  onSuccess,
}: CrmBulkImportDialogContentProps) {
  const canCreateProspects = useHasPermission('prospects:create');
  const canCreateCompanies = useHasPermission('companies:create');
  const { data: prospectSchema } = useProspectFieldSchema();
  const { data: companySchema } = useCompanyFieldSchema();

  const [entityType, setEntityType] =
    useState<CrmImportEntityType>(defaultEntityType);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CrmImportPreview | null>(null);
  const [importResult, setImportResult] = useState<CrmImportResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<CrmImportWizardFormValues>({
    resolver: zodResolver(crmImportWizardSchema),
    defaultValues: CRM_IMPORT_WIZARD_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const activeStep = CRM_IMPORT_WIZARD_STEPS[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === CRM_IMPORT_WIZARD_STEPS.length - 1;

  const schemaFields = useMemo(() => {
    if (entityType === 'prospect') {
      return prospectSchema?.fields ?? [];
    }

    return companySchema?.fields ?? [];
  }, [companySchema?.fields, entityType, prospectSchema?.fields]);

  function resetFlowForEntityChange(nextEntityType: CrmImportEntityType) {
    setEntityType(nextEntityType);
    setActiveStepIndex(0);
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
    setSaveError(null);
    form.reset(CRM_IMPORT_WIZARD_DEFAULT_VALUES);
  }

  async function loadPreview(
    file: File,
    fieldMapping?: Record<string, string>,
  ) {
    const payload = fieldMapping
      ? { fieldMapping: buildCrmImportFieldMappingPayload({ fieldMapping }) }
      : undefined;

    if (entityType === 'prospect') {
      return prospectsService.previewImport(file, payload);
    }

    return companiesService.previewImport(file, payload);
  }

  async function handleFileSelect(file: File) {
    setSaveError(null);
    setImportResult(null);
    setSelectedFile(file);
    setIsPreviewLoading(true);

    try {
      const previewResult = await loadPreview(file);
      setPreview(previewResult);
      form.setValue(
        'fieldMapping',
        applySuggestedFieldMapping(previewResult.suggestedMapping),
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

  async function refreshPreviewWithIssues(fieldMapping: Record<string, string>) {
    if (!selectedFile) {
      return;
    }

    setIsPreviewLoading(true);

    try {
      const previewResult = await loadPreview(selectedFile, fieldMapping);
      setPreview(previewResult);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to validate mapping'));
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleNext() {
    setSaveError(null);

    if (activeStep.id === 'upload') {
      if (!selectedFile || !preview) {
        setSaveError('Upload a file to continue.');
        return;
      }

      setActiveStepIndex(1);
      return;
    }

    if (activeStep.id === 'mapping') {
      const fieldMapping = form.getValues('fieldMapping');
      const validationError = preview
        ? validateRequiredFieldMappings(preview.importableFields, fieldMapping)
        : 'Upload a file to continue.';

      if (validationError) {
        setSaveError(validationError);
        return;
      }

      await refreshPreviewWithIssues(fieldMapping);
      setActiveStepIndex(2);
    }
  }

  function handleBack() {
    setSaveError(null);
    setImportResult(null);
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  async function handleImport() {
    setSaveError(null);

    if (!selectedFile || !preview) {
      setSaveError('Upload a file before importing.');
      return;
    }

    const fieldMapping = form.getValues('fieldMapping');
    const validationError = validateRequiredFieldMappings(
      preview.importableFields,
      fieldMapping,
    );

    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        fieldMapping: buildCrmImportFieldMappingPayload(form.getValues()),
      };
      const result =
        entityType === 'prospect'
          ? await prospectsService.importRows(selectedFile, payload)
          : await companiesService.importRows(selectedFile, payload);

      setImportResult(result);

      if (result.created > 0) {
        onSuccess();
      }
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to import records'));
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    if (isSaving) {
      return;
    }

    onClose();
  }

  const showEntityToggle = canCreateProspects && canCreateCompanies;

  return (
    <>
      <DialogTitle className="font-bold">Bulk upload</DialogTitle>
      <DialogContent>
        <Stack spacing={3} className="pb-1 pt-1">
          {showEntityToggle ? (
            <ToggleButtonGroup
              exclusive
              value={entityType}
              onChange={(_, value: CrmImportEntityType | null) => {
                if (value) {
                  resetFlowForEntityChange(value);
                }
              }}
              size="small"
              className="self-start"
            >
              {canCreateProspects ? (
                <ToggleButton value="prospect">Prospects</ToggleButton>
              ) : null}
              {canCreateCompanies ? (
                <ToggleButton value="company">Companies</ToggleButton>
              ) : null}
            </ToggleButtonGroup>
          ) : null}

          <CrmImportStepper activeStepIndex={activeStepIndex} />

          {saveError ? <Alert severity="error">{saveError}</Alert> : null}

          <FormProvider {...form}>
            {activeStep.id === 'upload' ? (
              <CrmImportUploadStep
                entityType={entityType}
                fields={schemaFields}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                isPreviewLoading={isPreviewLoading}
              />
            ) : null}

            {activeStep.id === 'mapping' && preview ? (
              <CrmImportMapFieldsStep preview={preview} />
            ) : null}

            {activeStep.id === 'review' && preview && selectedFile ? (
              <CrmImportReviewStep
                entityType={entityType}
                preview={preview}
                selectedFile={selectedFile}
                values={form.getValues()}
                importResult={importResult}
              />
            ) : null}
          </FormProvider>

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between' }}
          >
            <Button
              type="button"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={isFirstStep ? handleClose : handleBack}
              disabled={isSaving}
              className="rounded-xl"
            >
              {isFirstStep ? 'Cancel' : 'Back'}
            </Button>

            {isLastStep ? (
              importResult ? (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleClose}
                  className="rounded-xl px-5 shadow-primary-soft"
                >
                  Done
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleImport}
                  disabled={isSaving || isPreviewLoading}
                  className="rounded-xl px-5 shadow-primary-soft"
                >
                  {isSaving ? 'Importing...' : 'Import'}
                </Button>
              )
            ) : (
              <Button
                type="button"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                disabled={
                  activeStep.id === 'upload'
                    ? !selectedFile || isPreviewLoading
                    : isPreviewLoading
                }
                className="rounded-xl px-5 shadow-primary-soft"
              >
                {activeStep.id === 'upload'
                  ? 'Next: Map fields →'
                  : 'Next: Review →'}
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </>
  );
}

export default function CrmBulkImportDialog({
  open,
  defaultEntityType,
  onClose,
  onSuccess,
}: CrmBulkImportDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {open ? (
        <CrmBulkImportDialogContent
          key={defaultEntityType}
          defaultEntityType={defaultEntityType}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Dialog>
  );
}

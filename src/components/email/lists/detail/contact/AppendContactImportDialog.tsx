'use client';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import ListColumnMappingStep from '@/components/email/lists/import/steps/ListColumnMappingStep';
import ReviewStep from '@/components/email/lists/import/steps/ReviewStep';
import { contactListService, getApiErrorMessage } from '@/lib/api';
import {
  buildFieldMappingFromTableColumnMappings,
  buildMappingsFromTableColumns,
} from '@/lib/email/lists/list-column-mapping-utils';
import type {
  ContactListAppendImportInput,
  ContactListAppendResult,
  ContactListFieldSchema,
} from '@/lib/email/lists/detail-types';
import type { ContactListImportPreview } from '@/lib/email/lists/types';
import {
  LIST_IMPORT_WIZARD_DEFAULT_VALUES,
  createListImportWizardSchema,
  type ListImportWizardFormValues,
} from '@/lib/schemas/contact-list-import';
import {
  type ListColumnMappingTarget,
} from '@/lib/schemas/list-column-mapping';

function fieldSchemaToMappingTargets(
  fieldSchema: ContactListFieldSchema,
): ListColumnMappingTarget[] {
  return [
    {
      key: fieldSchema.email.key,
      label: fieldSchema.email.label,
      required: true,
      type: 'email',
    },
    ...fieldSchema.fields.map((field) => ({
      key: field.key,
      label: field.label,
      required: false,
      type: 'text',
    })),
  ];
}

interface AppendContactImportDialogProps {
  open: boolean;
  listId: string;
  fieldSchema: ContactListFieldSchema;
  isSubmitting: boolean;
  onClose: () => void;
  onComplete: (result: ContactListAppendResult) => Promise<void>;
}

export default function AppendContactImportDialog({
  open,
  listId,
  fieldSchema,
  isSubmitting,
  onClose,
  onComplete,
}: AppendContactImportDialogProps) {
  const targetColumns = useMemo(
    () => fieldSchemaToMappingTargets(fieldSchema),
    [fieldSchema],
  );

  const wizardSchema = useMemo(
    () =>
      createListImportWizardSchema(
        targetColumns.map((column, index) => ({
          id: `append-${column.key}`,
          key: column.key,
          label: column.label,
          type: column.type === 'email' ? 'email' : 'text',
          required: column.required ?? false,
          sortOrder: index,
        })),
      ),
    [targetColumns],
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ContactListImportPreview | null>(null);
  const [step, setStep] = useState<'upload' | 'map' | 'review'>('upload');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ListImportWizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: LIST_IMPORT_WIZARD_DEFAULT_VALUES,
    mode: 'onTouched',
  });
  const watchedValues = useWatch({ control: form.control });

  function handleClose() {
    setSelectedFile(null);
    setPreview(null);
    setStep('upload');
    setError(null);
    form.reset(LIST_IMPORT_WIZARD_DEFAULT_VALUES);
    onClose();
  }

  async function handleFileSelect(file: File) {
    setError(null);
    setSelectedFile(file);
    setIsPreviewLoading(true);

    try {
      const previewResult = await contactListService.previewAppendImport(
        listId,
        file,
      );
      setPreview(previewResult);
      form.setValue(
        'columnMappings',
        buildMappingsFromTableColumns(targetColumns, previewResult.columns),
      );
      form.setValue('name', 'Existing list');
      setStep('map');
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, 'Unable to preview file'));
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleImport() {
    if (!selectedFile || !preview) {
      return;
    }

    setError(null);
    const isValid = await form.trigger(['columnMappings']);
    if (!isValid) {
      return;
    }

    const values = form.getValues();
    const payload: ContactListAppendImportInput = {
      fieldMapping: buildFieldMappingFromTableColumnMappings(
        targetColumns,
        values.columnMappings,
      ),
    };

    try {
      const result = await contactListService.appendImport(
        listId,
        selectedFile,
        payload,
      );
      await onComplete(result);
      handleClose();
    } catch (importError) {
      setError(getApiErrorMessage(importError, 'Unable to import contacts'));
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Bulk upload contacts</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          {error ? (
            <Alert severity="error" className="rounded-2xl">
              {error}
            </Alert>
          ) : null}

          {step === 'upload' ? (
            <Box className="rounded-2xl border border-dashed border-border p-6 text-center">
              <UploadFileOutlinedIcon className="mb-2 text-text-secondary" />
              <Typography variant="body2" color="text.secondary" className="mb-3">
                Upload a CSV or Excel file to append contacts to this list.
              </Typography>
              <Button variant="outlined" component="label" disabled={isPreviewLoading}>
                {isPreviewLoading ? 'Previewing…' : 'Choose file'}
                <input
                  hidden
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleFileSelect(file);
                    }
                  }}
                />
              </Button>
            </Box>
          ) : null}

          {step !== 'upload' && preview ? (
            <FormProvider {...form}>
              {step === 'map' ? (
                <ListColumnMappingStep
                  targetColumns={targetColumns}
                  fileColumns={preview.columns}
                />
              ) : null}
              {step === 'review' && selectedFile && watchedValues ? (
                <ReviewStep
                  preview={preview}
                  selectedFile={selectedFile}
                  values={watchedValues as ListImportWizardFormValues}
                  targetColumns={targetColumns}
                />
              ) : null}
            </FormProvider>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        {step === 'map' ? (
          <Button
            variant="contained"
            onClick={async () => {
              const isValid = await form.trigger(['columnMappings']);
              if (isValid) {
                setStep('review');
              }
            }}
          >
            Review
          </Button>
        ) : null}
        {step === 'review' ? (
          <Button
            variant="contained"
            onClick={() => void handleImport()}
            disabled={isSubmitting}
          >
            Import contacts
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

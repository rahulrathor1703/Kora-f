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
import { FormProvider, useForm } from 'react-hook-form';
import ListColumnMappingStep from '@/components/email/lists/import/steps/ListColumnMappingStep';
import { useFormSchema } from '@/hooks/useForms';
import { getApiErrorMessage, manualListService } from '@/lib/api';
import { buildMappingsFromTableColumns } from '@/lib/email/lists/list-column-mapping-utils';
import type { ManualListAppendResult, ManualListColumn } from '@/lib/lists/types';
import {
  createListColumnMappingsSchema,
  type ListColumnMappingTarget,
} from '@/lib/schemas/list-column-mapping';
import { z } from 'zod';

const MANUAL_LIST_IMPORT_FORM_KEY = 'email.list.manual.import';

const appendManualImportFormSchema = z.object({
  columnMappings: z.array(
    z.object({
      targetColumnKey: z.string(),
      sourceColumn: z.string(),
    }),
  ),
});

type AppendManualImportFormValues = z.infer<typeof appendManualImportFormSchema>;

function listColumnsToTargets(
  columns: ManualListColumn[],
  requiredKeys: Set<string>,
): ListColumnMappingTarget[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    required: requiredKeys.has(column.key),
  }));
}

interface AppendManualImportDialogProps {
  open: boolean;
  listId: string;
  columns: ManualListColumn[];
  isSubmitting: boolean;
  onClose: () => void;
  onComplete: (result: ManualListAppendResult) => Promise<void>;
}

export default function AppendManualImportDialog({
  open,
  listId,
  columns,
  isSubmitting,
  onClose,
  onComplete,
}: AppendManualImportDialogProps) {
  const { data: importSchema } = useFormSchema(MANUAL_LIST_IMPORT_FORM_KEY);
  const requiredKeys = useMemo(
    () =>
      new Set(
        (importSchema?.tableColumns ?? [])
          .filter((column) => column.required)
          .map((column) => column.key),
      ),
    [importSchema?.tableColumns],
  );

  const targetColumns = useMemo(
    () => listColumnsToTargets(columns, requiredKeys),
    [columns, requiredKeys],
  );

  const mappingSchema = useMemo(
    () =>
      appendManualImportFormSchema.extend({
        columnMappings: createListColumnMappingsSchema(
          targetColumns.map((column, index) => ({
            id: `manual-${column.key}`,
            key: column.key,
            label: column.label,
            type: 'text',
            required: column.required ?? false,
            sortOrder: index,
          })),
        ),
      }),
    [targetColumns],
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const form = useForm<AppendManualImportFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: { columnMappings: [] },
    mode: 'onTouched',
  });

  function handleClose() {
    setSelectedFile(null);
    setPreviewColumns([]);
    setError(null);
    form.reset({ columnMappings: [] });
    onClose();
  }

  async function handleFileSelect(file: File) {
    setError(null);
    setSelectedFile(file);
    setIsPreviewLoading(true);

    try {
      const preview = await manualListService.previewAppendImport(listId, file);
      setPreviewColumns(preview.columns);
      form.setValue(
        'columnMappings',
        buildMappingsFromTableColumns(targetColumns, preview.columns),
      );
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, 'Unable to preview file'));
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleImport() {
    if (!selectedFile) {
      return;
    }

    setError(null);
    const isValid = await form.trigger(['columnMappings']);
    if (!isValid) {
      return;
    }

    const values = form.getValues();

    try {
      const result = await manualListService.appendImport(listId, selectedFile, {
        columnMappings: values.columnMappings
          .filter((mapping) => mapping.sourceColumn.trim())
          .map((mapping) => ({
            listColumnKey: mapping.targetColumnKey,
            sourceColumn: mapping.sourceColumn.trim(),
          })),
      });
      await onComplete(result);
      handleClose();
    } catch (importError) {
      setError(getApiErrorMessage(importError, 'Unable to import rows'));
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Bulk upload rows</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          {error ? (
            <Alert severity="error" className="rounded-2xl">
              {error}
            </Alert>
          ) : null}

          {!selectedFile ? (
            <Box className="rounded-2xl border border-dashed border-border p-6 text-center">
              <UploadFileOutlinedIcon className="mb-2 text-text-secondary" />
              <Typography variant="body2" color="text.secondary" className="mb-3">
                Upload a CSV or Excel file to append rows to this list.
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
          ) : (
            <FormProvider {...form}>
              <ListColumnMappingStep
                targetColumns={targetColumns}
                fileColumns={previewColumns}
              />
            </FormProvider>
          )}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        {selectedFile ? (
          <Button
            variant="contained"
            onClick={() => void handleImport()}
            disabled={isSubmitting}
          >
            Import rows
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

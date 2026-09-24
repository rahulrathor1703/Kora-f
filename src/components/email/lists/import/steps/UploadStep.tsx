'use client';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useNotify } from '@/hooks/useNotify';
import type { ListImportWizardFormValues } from '@/lib/schemas/contact-list-import';

const LIST_NAME_REQUIRED_MESSAGE = 'Please enter a list name before uploading your file.';

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls,.json,.txt,.pdf';

interface UploadStepProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  isPreviewLoading: boolean;
}

export default function UploadStep({
  selectedFile,
  onFileSelect,
  isPreviewLoading,
}: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { notify } = useNotify();
  const { control, getValues, setError, clearErrors } =
    useFormContext<ListImportWizardFormValues>();

  function hasListName(): boolean {
    return getValues('name').trim().length > 0;
  }

  function showListNameRequiredFeedback() {
    notify(LIST_NAME_REQUIRED_MESSAGE, { variant: 'warning' });
    setError('name', {
      type: 'manual',
      message: 'List name is required',
    });
  }

  function handleUploadClick() {
    if (isPreviewLoading) {
      return;
    }

    if (!hasListName()) {
      showListNameRequiredFeedback();
      return;
    }

    clearErrors('name');
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!hasListName()) {
      showListNameRequiredFeedback();
      event.target.value = '';
      return;
    }

    clearErrors('name');
    onFileSelect(file);
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" className="font-bold">
          Create a new contact list
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Name your list and upload a file to import contacts.
        </Typography>
      </Box>

      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="List name"
            placeholder="e.g. Q1 prospects"
            fullWidth
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            className="rounded-xl"
          />
        )}
      />

      <Box>
        <Typography variant="subtitle2" className="mb-2 font-semibold">
          Upload file
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={handleUploadClick}
          disabled={isPreviewLoading}
          aria-label="Upload contact list file"
          className="w-full rounded-2xl border-2 border-dashed border-border bg-background p-8 text-left transition-colors hover:border-primary hover:bg-primary-soft/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box className="rounded-2xl bg-primary-soft p-3 text-primary">
              <CloudUploadOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="subtitle1" className="font-semibold">
              {isPreviewLoading
                ? 'Analyzing file...'
                : 'Click to upload or drag a file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports CSV, Excel, JSON, TXT, and PDF up to 10 MB
            </Typography>
            {selectedFile ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center' }}
                className="mt-2 rounded-xl bg-surface px-3 py-2"
              >
                <InsertDriveFileOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="body2" className="font-medium">
                  {selectedFile.name}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileChange}
        />
      </Box>
    </Stack>
  );
}

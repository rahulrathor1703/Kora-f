'use client';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';
import { downloadCrmImportTemplate } from '@/lib/crm/import/template-utils';
import type { CrmImportEntityType } from '@/lib/crm/import/types';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls,.json,.txt';

interface CrmImportUploadStepProps {
  entityType: CrmImportEntityType;
  fields: ProspectFieldDefinition[] | CompanyFieldDefinition[];
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  isPreviewLoading: boolean;
}

export default function CrmImportUploadStep({
  entityType,
  fields,
  selectedFile,
  onFileSelect,
  isPreviewLoading,
}: CrmImportUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const entityLabel = entityType === 'prospect' ? 'prospects' : 'companies';

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" className="font-bold">
          Upload {entityLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Upload a CSV or Excel file with columns matching your manage-fields
          schema.
        </Typography>
      </Box>

      <Box>
        <Button
          type="button"
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={() => downloadCrmImportTemplate(entityType, fields)}
          className="rounded-xl"
        >
          Download template
        </Button>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-2 font-semibold">
          Upload file
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPreviewLoading}
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
              Supports CSV, Excel, JSON, and TXT up to 10 MB
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

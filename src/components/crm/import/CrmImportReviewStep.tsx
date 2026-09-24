'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type {
  CrmImportEntityType,
  CrmImportPreview,
  CrmImportResult,
} from '@/lib/crm/import/types';
import type { CrmImportWizardFormValues } from '@/lib/schemas/crm-import';

interface CrmImportReviewStepProps {
  entityType: CrmImportEntityType;
  preview: CrmImportPreview;
  selectedFile: File;
  values: CrmImportWizardFormValues;
  importResult?: CrmImportResult | null;
}

export default function CrmImportReviewStep({
  entityType,
  preview,
  selectedFile,
  values,
  importResult,
}: CrmImportReviewStepProps) {
  const entityLabel = entityType === 'prospect' ? 'prospects' : 'companies';
  const mappedFields = preview.importableFields.filter(
    (field) => values.fieldMapping[field.key]?.trim(),
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" className="font-bold">
          {importResult ? 'Import complete' : 'Review and import'}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {importResult
            ? `Imported ${importResult.created.toLocaleString()} ${entityLabel}.`
            : `Confirm your mapping before importing ${entityLabel}.`}
        </Typography>
      </Box>

      <Stack spacing={2} className="rounded-2xl border border-border p-4">
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Entity
          </Typography>
          <Typography variant="body2" className="font-semibold capitalize">
            {entityLabel}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            File
          </Typography>
          <Typography variant="body2" className="font-semibold">
            {selectedFile.name}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Rows detected
          </Typography>
          <Typography variant="body2" className="font-semibold">
            {preview.rowCount.toLocaleString()}
          </Typography>
        </Stack>
        {importResult ? (
          <>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2" className="font-semibold">
                {importResult.created.toLocaleString()}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
              <Typography variant="body2" className="font-semibold">
                {importResult.failed.toLocaleString()}
              </Typography>
            </Stack>
          </>
        ) : null}
      </Stack>

      <Box>
        <Typography variant="subtitle1" className="mb-2 font-semibold">
          Field mapping
        </Typography>
        <Stack spacing={1.5}>
          {mappedFields.map((field) => (
            <Stack
              key={field.key}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography variant="body2">{field.label}</Typography>
              <Chip
                label={values.fieldMapping[field.key]}
                size="small"
                color="primary"
                className="rounded-lg"
              />
            </Stack>
          ))}
        </Stack>
      </Box>

      {!importResult && preview.rowIssues && preview.rowIssues.length > 0 ? (
        <Alert severity="warning">
          {preview.rowIssues.length} row
          {preview.rowIssues.length === 1 ? '' : 's'} will fail validation or
          duplicate checks during import.
        </Alert>
      ) : null}

      {(importResult?.errors.length ?? preview.rowIssues?.length ?? 0) > 0 ? (
        <Box>
          <Typography variant="subtitle1" className="mb-2 font-semibold">
            Row issues
          </Typography>
          <Box className="max-h-56 overflow-auto rounded-2xl border border-border">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(importResult?.errors ?? preview.rowIssues ?? []).map(
                  (issue, index) => (
                    <TableRow key={`${issue.row}-${issue.key}-${index}`}>
                      <TableCell>{issue.row}</TableCell>
                      <TableCell>{issue.key}</TableCell>
                      <TableCell>{issue.message}</TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ) : null}
    </Stack>
  );
}

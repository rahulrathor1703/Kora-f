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
import {
  buildPreviewRowsFromTableMappings,
  getPreviewColumnsFromTableMappings,
} from '@/lib/email/lists/list-column-mapping-utils';
import type { ContactListImportPreview } from '@/lib/email/lists/types';
import type { ListColumnMappingTarget } from '@/lib/schemas/list-column-mapping';
import type { ListImportWizardFormValues } from '@/lib/schemas/contact-list-import';

interface ReviewStepProps {
  preview: ContactListImportPreview;
  selectedFile: File;
  values: ListImportWizardFormValues;
  targetColumns: ListColumnMappingTarget[];
}

export default function ReviewStep({
  preview,
  selectedFile,
  values,
  targetColumns,
}: ReviewStepProps) {
  const previewColumns = getPreviewColumnsFromTableMappings(
    values.columnMappings,
    targetColumns,
  );
  const previewRows = buildPreviewRowsFromTableMappings(
    preview.sampleRows,
    values.columnMappings,
    targetColumns,
  );

  const mappedCount = values.columnMappings.filter((mapping) =>
    mapping.sourceColumn.trim(),
  ).length;

  const labelByKey = new Map(
    targetColumns.map((column) => [column.key, column.label]),
  );

  const hasListName = values.name.trim().length > 0;

  return (
    <Stack spacing={3}>
      {!hasListName ? (
        <Alert severity="warning" className="rounded-2xl">
          List name is required. Go back to the upload step to add one.
        </Alert>
      ) : null}

      <Box>
        <Typography variant="h6" className="font-bold">
          Review and import
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Confirm your list details before importing contacts.
        </Typography>
      </Box>

      <Stack spacing={2} className="rounded-2xl border border-border p-4">
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            List name
          </Typography>
          <Typography
            variant="body2"
            className={hasListName ? 'font-semibold' : 'font-semibold text-error'}
          >
            {hasListName ? values.name : 'Not set'}
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
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Columns mapped
          </Typography>
          <Typography variant="body2" className="font-semibold">
            {mappedCount}
          </Typography>
        </Stack>
      </Stack>

      <Box>
        <Typography variant="subtitle1" className="mb-2 font-semibold">
          Column mapping
        </Typography>
        <Stack spacing={1.5}>
          {values.columnMappings
            .filter((mapping) => mapping.sourceColumn.trim())
            .map((mapping) => (
              <Stack
                key={mapping.targetColumnKey}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body2">
                  {labelByKey.get(mapping.targetColumnKey) ??
                    mapping.targetColumnKey}
                </Typography>
                <Chip
                  label={mapping.sourceColumn}
                  size="small"
                  className="rounded-lg"
                />
              </Stack>
            ))}
        </Stack>
      </Box>

      {previewRows.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" className="mb-2 font-semibold">
            Import preview
          </Typography>
          <Box className="overflow-x-auto rounded-2xl border border-border">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {previewColumns.map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {previewColumns.map((column) => (
                      <TableCell key={column}>{row[column] ?? '—'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ) : null}
    </Stack>
  );
}

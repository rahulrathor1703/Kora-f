'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext } from 'react-hook-form';
import { countAutoMatchedTableColumns } from '@/lib/email/lists/list-column-mapping-utils';
import type { ListColumnMappingTarget } from '@/lib/schemas/list-column-mapping';

interface ListColumnMappingStepProps {
  targetColumns: ListColumnMappingTarget[];
  fileColumns: string[];
}

function AutoMatchBanner({
  targetColumns,
  fileColumns,
  mappings,
}: {
  targetColumns: ListColumnMappingTarget[];
  fileColumns: string[];
  mappings: Array<{ targetColumnKey: string; sourceColumn: string }>;
}) {
  const matchedCount = countAutoMatchedTableColumns(mappings);

  if (matchedCount === 0) {
    return (
      <Alert severity="info" className="rounded-2xl">
        We found {fileColumns.length} columns in your file. Map each list column
        to the matching file column.
      </Alert>
    );
  }

  return (
    <Alert severity="success" className="rounded-2xl">
      We matched {matchedCount} of {targetColumns.length} list column
      {targetColumns.length === 1 ? '' : 's'}. Adjust mappings as needed before
      importing.
    </Alert>
  );
}

export default function ListColumnMappingStep({
  targetColumns,
  fileColumns,
}: ListColumnMappingStepProps) {
  const { control, watch } = useFormContext<{ columnMappings: Array<{ targetColumnKey: string; sourceColumn: string }> }>();
  const mappings = watch('columnMappings') ?? [];

  return (
    <Stack spacing={3}>
      <BoxHeader />
      <AutoMatchBanner
        targetColumns={targetColumns}
        fileColumns={fileColumns}
        mappings={mappings}
      />

      <Box
        className="rounded-2xl border border-border"
        sx={{
          maxHeight: { xs: '42vh', sm: '50vh' },
          overflow: 'auto',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'background.paper' }}>List column</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>File column</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {targetColumns.map((column, index) => (
              <TableRow key={column.key}>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" className="font-medium">
                      {column.label}
                    </Typography>
                    {column.required ? (
                      <Chip label="Required" size="small" color="primary" />
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Controller
                    control={control}
                    name={`columnMappings.${index}.sourceColumn`}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        select
                        size="small"
                        fullWidth
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                        label="Select file column"
                      >
                        <MenuItem value="">
                          <em>{column.required ? 'Select column' : 'None'}</em>
                        </MenuItem>
                        {fileColumns.map((fileColumn) => (
                          <MenuItem key={fileColumn} value={fileColumn}>
                            {fileColumn}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}

function BoxHeader() {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h6" className="font-bold">
        Match columns
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Map your predefined list columns to columns from the uploaded file.
      </Typography>
    </Stack>
  );
}

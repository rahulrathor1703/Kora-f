'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import { collectUsedSourceColumns } from '@/lib/crm/import/template-utils';
import type { CrmImportFieldDescriptor, CrmImportPreview } from '@/lib/crm/import/types';
import type { CrmImportWizardFormValues } from '@/lib/schemas/crm-import';

interface CrmImportMapFieldsStepProps {
  preview: CrmImportPreview;
}

function FieldColumnSelect({
  field,
  columns,
}: {
  field: CrmImportFieldDescriptor;
  columns: string[];
}) {
  const { control, watch } = useFormContext<CrmImportWizardFormValues>();
  const currentValue = watch(`fieldMapping.${field.key}`) ?? '';
  const usedColumns = collectUsedSourceColumns(
    watch('fieldMapping') ?? {},
    currentValue,
  );

  return (
    <Controller
      name={`fieldMapping.${field.key}`}
      control={control}
      render={({ field: formField }) => (
        <TextField
          {...formField}
          value={formField.value ?? ''}
          select
          fullWidth
          size="small"
          label={field.label}
          required={field.required}
          className="rounded-xl"
          slotProps={{
            select: {
              displayEmpty: true,
            },
          }}
        >
          <MenuItem value="">
            <Typography component="span" color="text.secondary">
              Select column
            </Typography>
          </MenuItem>
          {columns.map((column) => {
            const isUsedElsewhere =
              usedColumns.has(column) && column !== currentValue;

            return (
              <MenuItem key={column} value={column} disabled={isUsedElsewhere}>
                {column}
              </MenuItem>
            );
          })}
        </TextField>
      )}
    />
  );
}

export default function CrmImportMapFieldsStep({
  preview,
}: CrmImportMapFieldsStepProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" className="font-bold">
          Map fields
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Match each CRM field to a column from your uploaded file.
        </Typography>
      </Box>

      <Alert severity="info">
        Required fields are marked with an asterisk. Each file column can only
        be mapped once.
      </Alert>

      <Stack spacing={2}>
        {preview.importableFields.map((field) => (
          <FieldColumnSelect
            key={field.key}
            field={field}
            columns={preview.columns}
          />
        ))}
      </Stack>

      <Box>
        <Typography variant="subtitle1" className="mb-2 font-semibold">
          Sample rows
        </Typography>
        <Box className="overflow-x-auto rounded-2xl border border-border">
          <Table size="small">
            <TableHead>
              <TableRow>
                {preview.columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.sampleRows.map((row, index) => (
                <TableRow key={`sample-${index}`}>
                  {preview.columns.map((column) => (
                    <TableCell key={`${index}-${column}`}>
                      {row[column] ?? ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}

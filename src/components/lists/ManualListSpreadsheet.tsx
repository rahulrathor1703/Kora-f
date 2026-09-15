'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { resolveManualListColumnKeys } from '@/lib/lists/column-utils';
import type { ManualListBuilderFormValues } from '@/lib/schemas/manual-list';

function createEmptyRowValues(keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, '']));
}

interface ManualListSpreadsheetProps {
  embedded?: boolean;
}

export default function ManualListSpreadsheet({
  embedded = false,
}: ManualListSpreadsheetProps) {
  const { control, getValues, setValue } =
    useFormContext<ManualListBuilderFormValues>();

  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
  } = useFieldArray({
    control,
    name: 'columns',
  });

  const {
    fields: rowFields,
    append: appendRow,
    remove: removeRow,
  } = useFieldArray({
    control,
    name: 'rows',
  });

  const watchedColumns = useWatch({ control, name: 'columns' });
  const resolvedColumns = resolveManualListColumnKeys(
    (watchedColumns ?? []).map((column) => column.label),
  ).filter((column) => column.key);
  const columnKeys = resolvedColumns.map((column) => column.key);
  const hasColumns = resolvedColumns.length > 0;

  function handleAddColumn() {
    appendColumn({ label: '' });
  }

  function handleRemoveColumn(index: number) {
    const keyToRemove = resolveManualListColumnKeys(
      (watchedColumns ?? []).map((column) => column.label),
    )[index]?.key;

    removeColumn(index);

    if (keyToRemove) {
      const currentRows = getValues('rows');
      setValue(
        'rows',
        currentRows.map((row) => ({
          values: Object.fromEntries(
            Object.entries(row.values).filter(([key]) => key !== keyToRemove),
          ),
        })),
      );
    }
  }

  function handleAddRow() {
    appendRow({ values: createEmptyRowValues(columnKeys) });
  }

  return (
    <Stack spacing={1.5}>
      {!embedded ? (
        <Box>
          <Typography variant="subtitle1" className="font-semibold">
            Contacts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Name your columns in the header row, then fill in contact details
            below.
          </Typography>
        </Box>
      ) : null}

      <Box className="overflow-x-auto rounded-xl border border-surface-border">
        <Table
          size="small"
          sx={{
            '& .MuiTableCell-root': {
              borderColor: 'var(--surface-border)',
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columnFields.map((field, index) => {
                const resolved = resolveManualListColumnKeys(
                  (watchedColumns ?? []).map((column) => column.label),
                )[index];

                return (
                  <TableCell key={field.id} className="min-w-[140px] align-top">
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
                      <Controller
                        name={`columns.${index}.label`}
                        control={control}
                        render={({ field: labelField, fieldState }) => (
                          <TextField
                            {...labelField}
                            size="small"
                            placeholder="Column name"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                            fullWidth
                          />
                        )}
                      />
                      <IconButton
                        type="button"
                        size="small"
                        color="error"
                        aria-label={`Remove ${resolved?.label || `column ${index + 1}`}`}
                        onClick={() => handleRemoveColumn(index)}
                        disabled={columnFields.length === 1}
                        sx={{ mt: 0.25 }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                );
              })}
              <TableCell className="w-12 align-top">
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Add column"
                  onClick={handleAddColumn}
                  sx={{ mt: 0.25 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!hasColumns ? (
              <TableRow>
                <TableCell
                  colSpan={columnFields.length + 1}
                  className="py-6 text-center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Name at least one column to start entering data.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rowFields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={resolvedColumns.length + 1} className="py-4">
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    className="rounded-lg"
                  >
                    Add first row
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              rowFields.map((field, rowIndex) => (
                <TableRow key={field.id}>
                  {resolvedColumns.map((column) => (
                    <TableCell key={`${field.id}-${column.key}`}>
                      <Controller
                        name={`rows.${rowIndex}.values.${column.key}`}
                        control={control}
                        defaultValue=""
                        render={({ field: cellField }) => (
                          <TextField
                            {...cellField}
                            value={cellField.value ?? ''}
                            size="small"
                            placeholder="—"
                            fullWidth
                          />
                        )}
                      />
                    </TableCell>
                  ))}
                  <TableCell align="right" className="w-12">
                    <IconButton
                      type="button"
                      size="small"
                      color="error"
                      aria-label="Remove row"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {hasColumns && rowFields.length > 0 ? (
        <Button
          type="button"
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          sx={{ alignSelf: 'flex-start' }}
          className="rounded-lg"
        >
          Add row
        </Button>
      ) : null}
    </Stack>
  );
}

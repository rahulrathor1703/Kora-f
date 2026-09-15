'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { dataTableClassNames, dataTableSx } from './dataTableStyles';
import { getActiveFieldFilters, type FieldFilter } from './filterTableRows';

interface FilterColumnOption {
  field: string;
  label: string;
}

interface DraftFilterRow {
  id: string;
  field: string;
  value: string;
}

interface DataTableFilterPanelProps {
  open: boolean;
  columns: FilterColumnOption[];
  initialFieldFilters: FieldFilter[];
  filterValueOptions?: Partial<Record<string, string[]>>;
  onApply: (filters: FieldFilter[]) => void;
  onClose: () => void;
}

function createDraftRow(
  columns: FilterColumnOption[],
  filter?: FieldFilter,
): DraftFilterRow {
  return {
    id: crypto.randomUUID(),
    field: filter?.field ?? columns[0]?.field ?? '',
    value: filter?.value ?? '',
  };
}

function createInitialDraftRows(
  columns: FilterColumnOption[],
  initialFieldFilters: FieldFilter[],
): DraftFilterRow[] {
  const activeFilters = getActiveFieldFilters(initialFieldFilters);
  if (activeFilters.length === 0) {
    return [createDraftRow(columns)];
  }

  return activeFilters.map((filter) => createDraftRow(columns, filter));
}

export default function DataTableFilterPanel({
  open,
  columns,
  initialFieldFilters,
  filterValueOptions,
  onApply,
  onClose,
}: DataTableFilterPanelProps) {
  const [draftRows, setDraftRows] = useState<DraftFilterRow[]>(() =>
    createInitialDraftRows(columns, initialFieldFilters),
  );

  function updateDraftRow(
    id: string,
    patch: Partial<Pick<DraftFilterRow, 'field' | 'value'>>,
  ) {
    setDraftRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function addDraftRow() {
    setDraftRows((current) => [...current, createDraftRow(columns)]);
  }

  function removeDraftRow(id: string) {
    setDraftRows((current) => {
      const next = current.filter((row) => row.id !== id);
      return next.length > 0 ? next : [createDraftRow(columns)];
    });
  }

  function handleApply() {
    onApply(
      draftRows
        .filter((row) => row.field && row.value.trim())
        .map(({ field, value }) => ({ field, value })),
    );
    onClose();
  }

  function handleClear() {
    setDraftRows([createDraftRow(columns)]);
    onApply([]);
    onClose();
  }

  const canRemoveRow = draftRows.length > 1;

  return (
    <Collapse in={open} timeout="auto">
      <Box
        className={`${dataTableClassNames.filterPanel} mt-3 rounded-2xl px-4 py-4`}
      >
        <Stack
          direction="row"
          spacing={1}
          className="mb-3 items-center justify-between"
        >
          <Stack direction="row" spacing={1} className="items-center">
            <FilterListOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" className="font-semibold">
              Filter by fields
            </Typography>
          </Stack>
          <Button
            variant="text"
            size="small"
            startIcon={<AddOutlinedIcon fontSize="small" />}
            onClick={addDraftRow}
            disabled={columns.length === 0}
          >
            Add filter
          </Button>
        </Stack>

        <Stack spacing={2}>
          {draftRows.map((row, index) => (
            <Stack
              key={row.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              className="items-start sm:items-end"
            >
              <FormControl size="small" className="w-full sm:min-w-[180px] sm:flex-1">
                <InputLabel id={`data-table-filter-field-label-${row.id}`}>
                  Field
                </InputLabel>
                <Select
                  labelId={`data-table-filter-field-label-${row.id}`}
                  value={row.field}
                  label="Field"
                  onChange={(event) =>
                    updateDraftRow(row.id, {
                      field: event.target.value,
                      value: '',
                    })
                  }
                >
                  {columns.map((column) => (
                    <MenuItem key={column.field} value={column.field}>
                      {column.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {filterValueOptions?.[row.field]?.length ? (
                <FormControl size="small" className="w-full sm:flex-[2]">
                  <InputLabel id={`data-table-filter-value-label-${row.id}`}>
                    {`Value${draftRows.length > 1 ? ` ${index + 1}` : ''}`}
                  </InputLabel>
                  <Select
                    labelId={`data-table-filter-value-label-${row.id}`}
                    value={row.value}
                    label={`Value${draftRows.length > 1 ? ` ${index + 1}` : ''}`}
                    onChange={(event) =>
                      updateDraftRow(row.id, { value: event.target.value })
                    }
                  >
                    <MenuItem value="">
                      <em>Select value</em>
                    </MenuItem>
                    {filterValueOptions[row.field]?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label={`Value${draftRows.length > 1 ? ` ${index + 1}` : ''}`}
                  value={row.value}
                  onChange={(event) =>
                    updateDraftRow(row.id, { value: event.target.value })
                  }
                  size="small"
                  className="w-full sm:flex-[2]"
                  placeholder="Enter filter value..."
                />
              )}

              <IconButton
                aria-label={`Remove filter ${index + 1}`}
                onClick={() => removeDraftRow(row.id)}
                disabled={!canRemoveRow}
                size="small"
                className="mb-0.5 shrink-0 self-end sm:mb-1"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} className="mt-4 justify-end">
          <Button variant="outlined" onClick={handleClear} size="small">
            Clear all
          </Button>
          <Button variant="contained" onClick={handleApply} size="small">
            Apply filters
          </Button>
        </Stack>
      </Box>
    </Collapse>
  );
}

interface DataTableFilterButtonProps {
  active: boolean;
  open: boolean;
  activeFilterCount?: number;
  onClick: () => void;
}

export function DataTableFilterButton({
  active,
  open,
  activeFilterCount = 0,
  onClick,
}: DataTableFilterButtonProps) {
  const isHighlighted = active || open;
  const badgeContent = useMemo(
    () => (activeFilterCount > 1 ? activeFilterCount : undefined),
    [activeFilterCount],
  );

  return (
    <Tooltip title={open ? 'Hide filters' : 'Filter by fields'}>
      <IconButton
        aria-label="Filter by fields"
        onClick={onClick}
        size="small"
        color={isHighlighted ? 'primary' : 'default'}
        sx={isHighlighted ? dataTableSx.iconButtonActive : undefined}
      >
        <Badge
          color="primary"
          variant={badgeContent ? 'standard' : 'dot'}
          badgeContent={badgeContent}
          invisible={!active}
        >
          <FilterListOutlinedIcon fontSize="small" />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

interface FilterColumnOption {
  field: string;
  label: string;
}

interface DataTableFieldFiltersSectionProps {
  filterOpen: boolean;
  filterColumns: FilterColumnOption[];
  fieldFilters: FieldFilter[];
  filterValueOptions?: Partial<Record<string, string[]>>;
  onFilterApply: (filters: FieldFilter[]) => void;
  onFilterToggle: () => void;
  filterSession: number;
}

function getFilterLabel(
  filter: FieldFilter,
  columns: FilterColumnOption[],
): string {
  const column = columns.find((item) => item.field === filter.field);
  return `${column?.label ?? filter.field}: ${filter.value}`;
}

export function DataTableFieldFiltersSection({
  filterOpen,
  filterColumns,
  fieldFilters,
  filterValueOptions,
  onFilterApply,
  onFilterToggle,
  filterSession,
}: DataTableFieldFiltersSectionProps) {
  const activeFilters = getActiveFieldFilters(fieldFilters);

  function handleRemoveFilter(filterToRemove: FieldFilter) {
    onFilterApply(
      activeFilters.filter(
        (filter) =>
          !(
            filter.field === filterToRemove.field &&
            filter.value === filterToRemove.value
          ),
      ),
    );
  }

  return (
    <>
      <DataTableFilterPanel
        key={filterSession}
        open={filterOpen}
        columns={filterColumns}
        initialFieldFilters={fieldFilters}
        filterValueOptions={filterValueOptions}
        onApply={onFilterApply}
        onClose={onFilterToggle}
      />

      {activeFilters.length > 0 ? (
        <Stack direction="row" spacing={1} className="mt-3 flex-wrap">
          {activeFilters.map((filter) => (
            <Chip
              key={`${filter.field}:${filter.value}`}
              label={getFilterLabel(filter, filterColumns)}
              size="small"
              onDelete={() => handleRemoveFilter(filter)}
              className="font-medium"
              color="primary"
              variant="outlined"
            />
          ))}
        </Stack>
      ) : null}
    </>
  );
}

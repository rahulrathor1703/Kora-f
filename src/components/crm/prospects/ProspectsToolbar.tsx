'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ProspectsMoreFiltersPopover from '@/components/crm/prospects/ProspectsMoreFiltersPopover';
import {
  countActiveSecondaryFilters,
  getActiveSecondaryFilters,
} from '@/lib/crm/prospects/filter-config';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface ProspectsToolbarProps {
  search: string;
  filters: Record<string, string>;
  primaryFields: ProspectFieldDefinition[];
  secondaryFields: ProspectFieldDefinition[];
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onSecondaryFiltersApply: (secondaryFilters: Record<string, string>) => void;
  onClearAllFilters: () => void;
}

interface ProspectInlineFilterSelectProps {
  field: ProspectFieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

function ProspectInlineFilterSelect({
  field,
  value,
  onChange,
}: ProspectInlineFilterSelectProps) {
  return (
    <TextField
      select
      size="small"
      label={field.label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-w-[10rem] flex-1 sm:max-w-[12rem]"
    >
      <MenuItem value="">All {field.label}</MenuItem>
      {field.options?.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function getFilterChipLabel(
  fieldKey: string,
  value: string,
  secondaryFields: ProspectFieldDefinition[],
): string {
  const field = secondaryFields.find((item) => item.key === fieldKey);
  const optionLabel =
    field?.options?.find((option) => option.value === value)?.label ?? value;

  return `${field?.label ?? fieldKey}: ${optionLabel}`;
}

export default function ProspectsToolbar({
  search,
  filters,
  primaryFields,
  secondaryFields,
  onSearchChange,
  onFilterChange,
  onSecondaryFiltersApply,
  onClearAllFilters,
}: ProspectsToolbarProps) {
  const activeSecondaryCount = countActiveSecondaryFilters(
    filters,
    secondaryFields,
  );
  const activeSecondaryFilters = getActiveSecondaryFilters(
    filters,
    secondaryFields,
  );
  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  return (
    <Paper className="rounded-2xl p-4">
      <Stack spacing={2.5}>
        <Box className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {primaryFields.length > 0 ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              className="flex-1 flex-wrap"
            >
              {primaryFields.map((field) => (
                <ProspectInlineFilterSelect
                  key={field.key}
                  field={field}
                  value={filters[field.key] ?? ''}
                  onChange={(value) => onFilterChange(field.key, value)}
                />
              ))}
            </Stack>
          ) : null}

          <Box className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <TextField
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name, email, designation..."
              size="small"
              className="w-full sm:w-72"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear search"
                        size="small"
                        onClick={() => onSearchChange('')}
                        edge="end"
                      >
                        <CloseOutlinedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            <ProspectsMoreFiltersPopover
              secondaryFields={secondaryFields}
              filters={filters}
              activeSecondaryCount={activeSecondaryCount}
              onApply={onSecondaryFiltersApply}
            />
          </Box>
        </Box>

        {activeSecondaryFilters.length > 0 ? (
          <Stack direction="row" spacing={1} className="flex-wrap gap-y-2">
            {activeSecondaryFilters.map(([fieldKey, value]) => (
              <Chip
                key={`${fieldKey}:${value}`}
                label={getFilterChipLabel(fieldKey, value, secondaryFields)}
                size="small"
                color="primary"
                variant="outlined"
                className="font-medium"
                onDelete={() => onFilterChange(fieldKey, '')}
              />
            ))}
          </Stack>
        ) : null}

        {hasActiveFilters ? (
          <Box>
            <Button variant="text" size="small" onClick={onClearAllFilters}>
              Clear all filters
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

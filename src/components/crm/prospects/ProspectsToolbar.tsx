'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import ProspectsAddFilterPopover from '@/components/crm/prospects/ProspectsAddFilterPopover';
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
  onClearAllFilters: () => void;
  configureFiltersHref?: string;
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
  fields: ProspectFieldDefinition[],
): string {
  const field = fields.find((item) => item.key === fieldKey);
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
  onClearAllFilters,
  configureFiltersHref,
}: ProspectsToolbarProps) {
  const allFilterFields = [...primaryFields, ...secondaryFields];
  const activeOptionalCount = countActiveSecondaryFilters(
    filters,
    secondaryFields,
  );
  const activeSecondaryFilters = getActiveSecondaryFilters(
    filters,
    secondaryFields,
  );
  const activePrimaryFilters = primaryFields
    .map((field) => [field.key, filters[field.key] ?? ''] as const)
    .filter(([, value]) => value.trim().length > 0);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  function handleAddFilter(fieldKey: string, value: string) {
    onFilterChange(fieldKey, value);
  }

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

            <ProspectsAddFilterPopover
              availableFields={secondaryFields}
              filters={filters}
              activeOptionalFilterCount={activeOptionalCount}
              onAddFilter={handleAddFilter}
              configureFiltersHref={configureFiltersHref}
            />
          </Box>
        </Box>

        {secondaryFields.length === 0 && configureFiltersHref ? (
          <Stack direction="row" spacing={1} className="items-center">
            <TuneOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              To let users add filters here, enable fields in{' '}
              <Link
                component={NextLink}
                href={configureFiltersHref}
                underline="hover"
              >
                Pipeline filters
              </Link>{' '}
              (Manage Forms).
            </Typography>
          </Stack>
        ) : null}

        {activePrimaryFilters.length + activeSecondaryFilters.length > 0 ? (
          <Stack direction="row" spacing={1} className="flex-wrap gap-y-2">
            {activePrimaryFilters.map(([fieldKey, value]) => (
              <Chip
                key={`primary-${fieldKey}:${value}`}
                label={getFilterChipLabel(fieldKey, value, allFilterFields)}
                size="small"
                color="primary"
                variant="outlined"
                className="font-medium"
                onDelete={() => onFilterChange(fieldKey, '')}
              />
            ))}
            {activeSecondaryFilters.map(([fieldKey, value]) => (
              <Chip
                key={`secondary-${fieldKey}:${value}`}
                label={getFilterChipLabel(fieldKey, value, allFilterFields)}
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

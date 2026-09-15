'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
} from '@/lib/crm/companies/types';

interface CompaniesToolbarProps {
  search: string;
  filters: Record<string, string>;
  filterableFields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onClearAllFilters: () => void;
}

interface CompanyInlineFilterSelectProps {
  field: CompanyFieldDefinition;
  value: string;
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  onChange: (value: string) => void;
}

function CompanyInlineFilterSelect({
  field,
  value,
  categories,
  locations,
  onChange,
}: CompanyInlineFilterSelectProps) {
  const options =
    field.type === 'company-category'
      ? categories.map((option) => ({ value: option.id, label: option.label }))
      : field.type === 'company-location'
        ? locations.map((option) => ({ value: option.id, label: option.label }))
        : (field.options ?? []);

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
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function CompaniesToolbar({
  search,
  filters,
  filterableFields,
  categories,
  locations,
  onSearchChange,
  onFilterChange,
  onClearAllFilters,
}: CompaniesToolbarProps) {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  return (
    <Paper className="rounded-2xl p-4">
      <Stack spacing={2.5}>
        <Box className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {filterableFields.length > 0 ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              className="flex-1 flex-wrap"
            >
              {filterableFields.map((field) => (
                <CompanyInlineFilterSelect
                  key={field.key}
                  field={field}
                  value={filters[field.key] ?? ''}
                  categories={categories}
                  locations={locations}
                  onChange={(value) => onFilterChange(field.key, value)}
                />
              ))}
            </Stack>
          ) : null}

          <TextField
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search broker name, officer, email..."
            size="small"
            className="w-full shrink-0 sm:w-72"
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
        </Box>

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

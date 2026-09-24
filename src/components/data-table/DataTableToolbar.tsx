'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { ReactNode } from 'react';
import { dataTableClassNames } from './dataTableStyles';
import {
  DataTableFilterButton,
  DataTableFieldFiltersSection,
} from './DataTableFilterPanel';
import { getActiveFieldFilters, type FieldFilter } from './filterTableRows';

interface FilterColumnOption {
  field: string;
  label: string;
}

interface DataTableToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  filterOpen?: boolean;
  filterActive?: boolean;
  onFilterToggle?: () => void;
  filterColumns?: FilterColumnOption[];
  fieldFilters?: FieldFilter[];
  filterValueOptions?: Partial<Record<string, string[]>>;
  onFilterApply?: (filters: FieldFilter[]) => void;
  filterSession?: number;
  toolbarActions?: ReactNode;
  leadingContent?: ReactNode;
}

export default function DataTableToolbar({
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = 'Search...',
  filterOpen = false,
  filterActive = false,
  onFilterToggle,
  filterColumns = [],
  fieldFilters = [],
  filterValueOptions,
  onFilterApply,
  filterSession = 0,
  toolbarActions,
  leadingContent,
}: DataTableToolbarProps) {
  const activeFilters = getActiveFieldFilters(fieldFilters);

  return (
    <Box className={`${dataTableClassNames.toolbar} px-4 py-4`}>
      <Box
        className={
          leadingContent
            ? 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'
            : 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'
        }
      >
        {leadingContent ? (
          <Box className="min-w-0 shrink-0">{leadingContent}</Box>
        ) : null}

        <Box className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <TextField
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            size="small"
            className="w-full rounded-xl sm:w-72"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear search"
                      size="small"
                      onClick={() => onSearchQueryChange('')}
                      edge="end"
                    >
                      <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box className={`${dataTableClassNames.iconButtonGroup} shrink-0`}>
            {onFilterToggle ? (
              <DataTableFilterButton
                active={filterActive}
                open={filterOpen}
                activeFilterCount={activeFilters.length}
                onClick={onFilterToggle}
              />
            ) : null}
            {toolbarActions}
          </Box>
        </Box>
      </Box>

      {onFilterApply ? (
        <DataTableFieldFiltersSection
          filterOpen={filterOpen}
          filterColumns={filterColumns}
          fieldFilters={fieldFilters}
          filterValueOptions={filterValueOptions}
          onFilterApply={onFilterApply}
          onFilterToggle={onFilterToggle ?? (() => undefined)}
          filterSession={filterSession}
        />
      ) : null}
    </Box>
  );
}

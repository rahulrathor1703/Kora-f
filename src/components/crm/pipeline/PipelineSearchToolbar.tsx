'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface PipelineSearchToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  primaryFields?: ProspectFieldDefinition[];
  filters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}

export default function PipelineSearchToolbar({
  search,
  onSearchChange,
  primaryFields = [],
  filters = {},
  onFilterChange,
}: PipelineSearchToolbarProps) {
  return (
    <Paper className="rounded-2xl p-4">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        className="flex-wrap items-stretch sm:items-center"
      >
        {primaryFields.length > 0 && onFilterChange
          ? primaryFields.map((field) => (
              <TextField
                key={field.key}
                select
                size="small"
                label={field.label}
                value={filters[field.key] ?? ''}
                onChange={(event) => onFilterChange(field.key, event.target.value)}
                className="min-w-[10rem] flex-1 sm:max-w-[12rem]"
              >
                <MenuItem value="">All {field.label}</MenuItem>
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))
          : null}

        <Box className="min-w-0 flex-1 sm:max-w-xl">
          <TextField
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, email, designation..."
            size="small"
            fullWidth
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
      </Stack>
    </Paper>
  );
}

'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AnalyticsFilterOptions, AnalyticsFilters } from '@/lib/email/analytics/types';

interface GlobalFilterBarProps {
  filters: AnalyticsFilters;
  filterOptions: AnalyticsFilterOptions | null;
  campaignCount: number | null;
  onChange: (filters: AnalyticsFilters) => void;
}

export default function GlobalFilterBar({
  filters,
  filterOptions,
  campaignCount,
  onChange,
}: GlobalFilterBarProps) {
  function updateFilter<Key extends keyof AnalyticsFilters>(
    key: Key,
    value: AnalyticsFilters[Key],
  ) {
    onChange({
      ...filters,
      [key]: value || null,
    });
  }

  return (
    <Box
      className="dashboard-panel"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        mb: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--color-secondary)',
          mr: 0.5,
        }}
      >
        GLOBAL FILTER:
      </Typography>

      <TextField
        select
        size="small"
        label="Brand"
        value={filters.brandId ?? ''}
        onChange={(event) => updateFilter('brandId', event.target.value || null)}
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return 'All Brands';
              }

              return (
                filterOptions?.brands.find((option) => option.id === selected)
                  ?.label ?? 'All Brands'
              );
            },
          },
        }}
        sx={{
          minWidth: 148,
          '& .MuiSelect-select': { color: 'text.primary', fontWeight: 500 },
        }}
      >
        <MenuItem value="">All Brands</MenuItem>
        {(filterOptions?.brands ?? []).map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Region"
        value={filters.regionId ?? ''}
        onChange={(event) => updateFilter('regionId', event.target.value || null)}
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return 'All Regions';
              }

              return (
                filterOptions?.regions.find((option) => option.id === selected)
                  ?.label ?? 'All Regions'
              );
            },
          },
        }}
        sx={{
          minWidth: 148,
          '& .MuiSelect-select': { color: 'text.primary', fontWeight: 500 },
        }}
      >
        <MenuItem value="">All Regions</MenuItem>
        {(filterOptions?.regions ?? []).map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Type"
        value={filters.campaignTypeId ?? ''}
        onChange={(event) =>
          updateFilter('campaignTypeId', event.target.value || null)
        }
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return 'All Types';
              }

              return (
                filterOptions?.types.find((option) => option.id === selected)
                  ?.label ?? 'All Types'
              );
            },
          },
        }}
        sx={{
          minWidth: 148,
          '& .MuiSelect-select': { color: 'text.primary', fontWeight: 500 },
        }}
      >
        <MenuItem value="">All Types</MenuItem>
        {(filterOptions?.types ?? []).map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Status"
        value={filters.status ?? ''}
        onChange={(event) => updateFilter('status', event.target.value || null)}
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return 'All Statuses';
              }

              return (
                filterOptions?.statuses.find((option) => option.value === selected)
                  ?.label ?? 'All Statuses'
              );
            },
          },
        }}
        sx={{
          minWidth: 148,
          '& .MuiSelect-select': { color: 'text.primary', fontWeight: 500 },
        }}
      >
        <MenuItem value="">All Statuses</MenuItem>
        {(filterOptions?.statuses ?? []).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ ml: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          {campaignCount ?? '—'} campaigns
        </Typography>
      </Box>
    </Box>
  );
}

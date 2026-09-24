'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext } from 'react-hook-form';
import type { AnalyticsFilterOptions } from '@/lib/email/analytics/types';
import type { WidgetWizardFormValues } from '@/lib/schemas/analytics-widget';

interface FiltersStepProps {
  filterOptions: AnalyticsFilterOptions | null;
}

export default function FiltersStep({ filterOptions }: FiltersStepProps) {
  const { control } = useFormContext<WidgetWizardFormValues>();

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: 'color-mix(in srgb, var(--foreground) 4%, transparent)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Leave filters empty to include all campaigns.
        </Typography>
      </Box>

      <Controller
        control={control}
        name="filters.brandId"
        render={({ field }) => (
          <TextField
            select
            label="BRAND"
            value={field.value ?? ''}
            onChange={(event) =>
              field.onChange(event.target.value || null)
            }
            fullWidth
          >
            <MenuItem value="">All Brands</MenuItem>
            {(filterOptions?.brands ?? []).map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="filters.regionId"
        render={({ field }) => (
          <TextField
            select
            label="REGION"
            value={field.value ?? ''}
            onChange={(event) =>
              field.onChange(event.target.value || null)
            }
            fullWidth
          >
            <MenuItem value="">All Regions</MenuItem>
            {(filterOptions?.regions ?? []).map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="filters.campaignTypeId"
        render={({ field }) => (
          <TextField
            select
            label="TYPE"
            value={field.value ?? ''}
            onChange={(event) =>
              field.onChange(event.target.value || null)
            }
            fullWidth
          >
            <MenuItem value="">All Types</MenuItem>
            {(filterOptions?.types ?? []).map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="filters.status"
        render={({ field }) => (
          <TextField
            select
            label="STATUS"
            value={field.value ?? ''}
            onChange={(event) =>
              field.onChange(event.target.value || null)
            }
            fullWidth
          >
            <MenuItem value="">All Statuses</MenuItem>
            {(filterOptions?.statuses ?? []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </Box>
  );
}

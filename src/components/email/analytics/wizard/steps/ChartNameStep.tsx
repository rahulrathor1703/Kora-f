'use client';

import type { ReactNode } from 'react';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  CHART_TYPE_OPTIONS,
  getChartTypeLabel,
  getGroupByLabel,
  getMetricLabel,
  suggestChartType,
} from '@/lib/email/analytics/types';
import type { AnalyticsChartType } from '@/lib/email/analytics/types';
import type { WidgetWizardFormValues } from '@/lib/schemas/analytics-widget';
import { METRIC_OPTIONS } from '@/lib/email/analytics/types';

const CHART_ICONS: Record<AnalyticsChartType, ReactNode> = {
  bar: <BarChartOutlinedIcon fontSize="small" />,
  line: <ShowChartOutlinedIcon fontSize="small" />,
  donut: <PieChartOutlineOutlinedIcon fontSize="small" />,
  stat_card: <TagOutlinedIcon fontSize="small" />,
  table: <GridOnOutlinedIcon fontSize="small" />,
};

export default function ChartNameStep() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<WidgetWizardFormValues>();
  const metric = useWatch({ control, name: 'metric' });
  const groupBy = useWatch({ control, name: 'groupBy' });
  const chartType = useWatch({ control, name: 'chartType' });
  const suggested = suggestChartType(metric, groupBy);
  const metricColor =
    METRIC_OPTIONS.find((option) => option.value === metric)?.color ??
    'var(--theme-primary)';

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1.5,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-secondary)',
          }}
        >
          CHART TYPE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {CHART_TYPE_OPTIONS.map((option) => {
            const selected = chartType === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="outlined"
                onClick={() =>
                  setValue('chartType', option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                startIcon={CHART_ICONS[option.value]}
                sx={{
                  textTransform: 'none',
                  borderColor: selected
                    ? 'var(--theme-primary)'
                    : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
                  color: selected ? 'var(--theme-primary)' : 'var(--foreground)',
                  bgcolor: selected
                    ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)'
                    : 'var(--surface)',
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Suggested:{' '}
          <Box component="span" sx={{ color: 'var(--theme-primary)', fontWeight: 600 }}>
            {getChartTypeLabel(suggested)}
          </Box>{' '}
          based on your metric and grouping.
        </Typography>
      </Box>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            {...field}
            label="WIDGET NAME *"
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
        )}
      />

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Widget Summary
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.75 }}>
          Metric:{' '}
          <Box component="span" sx={{ color: metricColor, fontWeight: 700 }}>
            {getMetricLabel(metric)}
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.75 }}>
          Grouped by:{' '}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {getGroupByLabel(groupBy)}
          </Box>
        </Typography>
        <Typography variant="body2">
          Chart:{' '}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {getChartTypeLabel(chartType)}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

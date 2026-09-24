'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  GROUP_BY_OPTIONS,
  METRIC_OPTIONS,
  buildDefaultWidgetName,
} from '@/lib/email/analytics/types';
import type { WidgetWizardFormValues } from '@/lib/schemas/analytics-widget';

export default function MetricGroupStep() {
  const { setValue, control } = useFormContext<WidgetWizardFormValues>();
  const metric = useWatch({ control, name: 'metric' });
  const groupBy = useWatch({ control, name: 'groupBy' });

  function selectMetric(nextMetric: WidgetWizardFormValues['metric']) {
    setValue('metric', nextMetric, { shouldDirty: true, shouldValidate: true });
    setValue('name', buildDefaultWidgetName(nextMetric, groupBy), {
      shouldDirty: true,
    });
  }

  function selectGroupBy(nextGroupBy: WidgetWizardFormValues['groupBy']) {
    setValue('groupBy', nextGroupBy, { shouldDirty: true, shouldValidate: true });
    setValue('name', buildDefaultWidgetName(metric, nextGroupBy), {
      shouldDirty: true,
    });
  }

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
          WHAT METRIC DO YOU WANT TO SHOW? *
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {METRIC_OPTIONS.map((option) => {
            const selected = metric === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="outlined"
                onClick={() => selectMetric(option.value)}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1.25,
                  px: 1.5,
                  py: 1.25,
                  textTransform: 'none',
                  borderColor: selected
                    ? option.color
                    : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
                  bgcolor: selected
                    ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)'
                    : 'var(--surface)',
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: option.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: selected ? 700 : 500 }}>
                  {option.label}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Box>

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
          GROUP BY *
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {GROUP_BY_OPTIONS.map((option) => {
            const selected = groupBy === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="outlined"
                onClick={() => selectGroupBy(option.value)}
                sx={{
                  justifyContent: 'flex-start',
                  px: 1.5,
                  py: 1.25,
                  textTransform: 'none',
                  color: selected ? 'var(--theme-primary)' : 'var(--foreground)',
                  borderColor: selected
                    ? 'var(--theme-primary)'
                    : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
                  bgcolor: selected
                    ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)'
                    : 'var(--surface)',
                  fontWeight: selected ? 700 : 500,
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { AnalyticsQueryResult } from '@/lib/email/analytics/types';
import { formatMetricValue } from '@/lib/email/analytics/types';

interface TableChartWidgetProps {
  data: AnalyticsQueryResult | null;
}

export default function TableChartWidget({ data }: TableChartWidgetProps) {
  const points = data?.points ?? [];

  if (points.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No data for the current filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            px: 1.5,
            py: 1,
            textAlign: 'left',
            borderBottom:
              '1px solid color-mix(in srgb, var(--foreground) 8%, transparent)',
            fontSize: 13,
          },
          '& th': {
            color: 'var(--color-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: 11,
          },
        }}
      >
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{formatMetricValue(point.value, data?.format ?? 'count')}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { AnalyticsQueryResult } from '@/lib/email/analytics/types';
import { formatMetricValue, getMetricLabel } from '@/lib/email/analytics/types';
import type { AnalyticsWidget } from '@/lib/email/analytics/types';

interface StatCardWidgetProps {
  widget: AnalyticsWidget;
  data: AnalyticsQueryResult | null;
}

export default function StatCardWidget({ widget, data }: StatCardWidgetProps) {
  const value =
    data?.total ??
    data?.points.reduce((sum, point) => sum + point.value, 0) ??
    0;

  return (
    <Box
      className="dashboard-stat-card flex h-full min-h-[180px] flex-col justify-center px-2"
      sx={{ textAlign: 'center' }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}
      >
        {formatMetricValue(value, data?.format ?? 'count')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {getMetricLabel(widget.metric)}
      </Typography>
    </Box>
  );
}

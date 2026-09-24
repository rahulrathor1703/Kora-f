'use client';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WidgetCard from '@/components/email/analytics/WidgetCard';
import type { AnalyticsDashboard, AnalyticsFilters, AnalyticsWidget } from '@/lib/email/analytics/types';
import { MAX_WIDGETS_PER_DASHBOARD } from '@/lib/email/analytics/types';

interface WidgetGridProps {
  dashboard: AnalyticsDashboard;
  globalFilters: AnalyticsFilters;
  hideEmptyState?: boolean;
  onAddWidget: () => void;
  onEditWidget: (widget: AnalyticsWidget) => void;
  onDeleteWidget: (widget: AnalyticsWidget) => void;
}

export default function WidgetGrid({
  dashboard,
  globalFilters,
  hideEmptyState = false,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
}: WidgetGridProps) {
  const widgetCount = dashboard.widgets.length;
  const atLimit = widgetCount >= MAX_WIDGETS_PER_DASHBOARD;

  if (widgetCount === 0 && hideEmptyState) {
    return null;
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {widgetCount === 0 ? (
        <Box
          className="dashboard-panel"
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            No widgets yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first widget to start tracking campaign performance on this dashboard.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddWidget}>
            Add Widget
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {dashboard.widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              globalFilters={globalFilters}
              onEdit={onEditWidget}
              onDelete={onDeleteWidget}
            />
          ))}
        </Box>
      )}

      {widgetCount > 0 ? (
        <Button
          type="button"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddWidget}
          disabled={atLimit}
          sx={{
            justifyContent: 'center',
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          + Add Widget ({widgetCount}/{MAX_WIDGETS_PER_DASHBOARD})
        </Button>
      ) : null}
    </Box>
  );
}

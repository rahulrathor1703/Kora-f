'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  AnalyticsBarChart,
  AnalyticsDonutChart,
  AnalyticsLineChart,
} from '@/components/email/analytics/charts/AnalyticsCharts';
import StatCardWidget from '@/components/email/analytics/charts/StatCardWidget';
import TableChartWidget from '@/components/email/analytics/charts/TableChartWidget';
import { useAnalyticsWidgetData } from '@/hooks/useAnalyticsDashboards';
import type { AnalyticsFilters, AnalyticsWidget } from '@/lib/email/analytics/types';
import {
  getGroupByLabel,
  getMetricLabel,
} from '@/lib/email/analytics/types';

interface WidgetCardProps {
  widget: AnalyticsWidget;
  globalFilters: AnalyticsFilters;
  onEdit: (widget: AnalyticsWidget) => void;
  onDelete: (widget: AnalyticsWidget) => void;
}

export default function WidgetCard({
  widget,
  globalFilters,
  onEdit,
  onDelete,
}: WidgetCardProps) {
  const { data, error, isLoading, refetch } = useAnalyticsWidgetData(
    widget.metric,
    widget.groupBy,
    widget.filters,
    globalFilters,
    true,
  );

  const subtitle = `${getMetricLabel(widget.metric)} — grouped by ${getGroupByLabel(widget.groupBy)}`;

  return (
    <Box
      className="dashboard-panel"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 280,
        p: 2,
      }}
    >
      <Stack
        direction="row"
        sx={{ mb: 1.5, alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {widget.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {subtitle}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Edit widget">
            <IconButton size="small" onClick={() => onEdit(widget)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete widget">
            <IconButton size="small" onClick={() => onDelete(widget)}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 200 }}>
        {isLoading ? (
          <Stack spacing={1} sx={{ py: 2 }}>
            <Skeleton variant="rounded" height={24} />
            <Skeleton variant="rounded" height={24} />
            <Skeleton variant="rounded" height={24} />
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          </Stack>
        ) : null}

        {!isLoading && error ? (
          <Alert
            severity="error"
            action={
              <IconButton size="small" aria-label="Retry widget" onClick={() => void refetch()}>
                ↻
              </IconButton>
            }
          >
            {error}
          </Alert>
        ) : null}

        {!isLoading && !error && data ? (
          <Box sx={{ height: widget.chartType === 'stat_card' ? 'auto' : 220 }}>
            {widget.chartType === 'bar' ? (
              <AnalyticsBarChart points={data.points} format={data.format} />
            ) : null}
            {widget.chartType === 'line' ? (
              <AnalyticsLineChart points={data.points} format={data.format} />
            ) : null}
            {widget.chartType === 'donut' ? (
              <AnalyticsDonutChart points={data.points} format={data.format} />
            ) : null}
            {widget.chartType === 'stat_card' ? (
              <StatCardWidget widget={widget} data={data} />
            ) : null}
            {widget.chartType === 'table' ? (
              <TableChartWidget data={data} />
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

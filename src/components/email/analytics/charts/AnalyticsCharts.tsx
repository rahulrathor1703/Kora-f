'use client';

import Box from '@mui/material/Box';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsQueryPoint } from '@/lib/email/analytics/types';
import { formatMetricValue } from '@/lib/email/analytics/types';

const CHART_COLORS = [
  '#818CF8',
  '#38BDF8',
  '#34D399',
  '#FBBF24',
  '#F87171',
  '#A78BFA',
  '#22D3EE',
  '#4ADE80',
];

interface ChartProps {
  points: AnalyticsQueryPoint[];
  format: 'count' | 'percent';
}

function ChartTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: { payload: AnalyticsQueryPoint }[];
  format: 'count' | 'percent';
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        bgcolor: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)',
      }}
    >
      <Box component="span" sx={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
        {point.label}
      </Box>
      <Box component="span" sx={{ display: 'block', fontSize: 12, color: 'var(--color-secondary)' }}>
        {formatMetricValue(point.value, format)}
      </Box>
    </Box>
  );
}

export function AnalyticsBarChart({ points, format }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          stroke="color-mix(in srgb, var(--foreground) 8%, transparent)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-secondary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-secondary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => formatMetricValue(value, format)}
        />
        <Tooltip content={<ChartTooltip format={format} />} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {points.map((point, index) => (
            <Cell key={point.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsLineChart({ points, format }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          stroke="color-mix(in srgb, var(--foreground) 8%, transparent)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-secondary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-secondary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => formatMetricValue(value, format)}
        />
        <Tooltip content={<ChartTooltip format={format} />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#818CF8"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#818CF8' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsDonutChart({ points, format }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={points}
          dataKey="value"
          nameKey="label"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={2}
        >
          {points.map((point, index) => (
            <Cell key={point.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip format={format} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

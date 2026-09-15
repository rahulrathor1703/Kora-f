'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyActivityPoint } from '@/lib/email/campaigns/activity-chart-utils';

const ACTIVITY_LINES = [
  { key: 'sent', label: 'Sent', color: '#0EA5E9' },
  { key: 'opened', label: 'Opened', color: '#F97316' },
  { key: 'clicked', label: 'Clicked', color: '#2563EB' },
  { key: 'replied', label: 'Replied', color: '#10B981' },
  { key: 'bounced', label: 'Bounced', color: '#EF4444' },
  { key: 'unsubscribed', label: 'Unsubscribed', color: '#64748B' },
] as const;

interface CampaignActivityChartProps {
  points: DailyActivityPoint[];
}

function ActivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      sx={{
        minWidth: 148,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
        boxShadow: '0 8px 24px color-mix(in srgb, var(--foreground) 10%, transparent)',
      }}
    >
      <Typography variant="caption" className="mb-1 block font-semibold">
        {label}
      </Typography>
      <Stack spacing={0.25}>
        {payload
          .filter((entry) => entry.value > 0)
          .map((entry) => (
            <Stack
              key={entry.dataKey}
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Box
                  className="h-1.5 w-1.5 rounded-full"
                  sx={{ bgcolor: entry.color }}
                />
                <Typography variant="caption" color="text.secondary" className="text-[10px]">
                  {ACTIVITY_LINES.find((line) => line.key === entry.dataKey)?.label ??
                    entry.dataKey}
                </Typography>
              </Stack>
              <Typography variant="caption" className="text-[10px] font-semibold">
                {entry.value}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </Box>
  );
}

export default function CampaignActivityChart({ points }: CampaignActivityChartProps) {
  const maxValue = useMemo(
    () =>
      Math.max(
        ...points.flatMap((point) => [
          point.sent,
          point.opened,
          point.clicked,
          point.replied,
          point.bounced,
          point.unsubscribed,
        ]),
        1,
      ),
    [points],
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: 260,
        borderRadius: 2,
        px: 1,
        py: 1.5,
        bgcolor: 'color-mix(in srgb, var(--foreground) 2.5%, transparent)',
        border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid
            stroke="color-mix(in srgb, var(--foreground) 6%, transparent)"
            vertical={false}
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--color-secondary)', fontSize: 10, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            domain={[0, Math.ceil(maxValue * 1.15)]}
            tick={{ fill: 'var(--color-secondary)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ActivityTooltip />} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, paddingBottom: 4 }}
          />
          {ACTIVITY_LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 2.5, fill: line.color }}
              activeDot={{ r: 4 }}
              animationDuration={720}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';
import type { EmailCampaignProgressRecipientStatus } from '@/lib/email/campaigns/recipient-types';

const STATUS_PALETTE: Record<
  string,
  { base: string; light: string; glow: string }
> = {
  pending: { base: '#94A3B8', light: '#CBD5E1', glow: 'rgba(148, 163, 184, 0.35)' },
  sent: { base: '#0EA5E9', light: '#7DD3FC', glow: 'rgba(14, 165, 233, 0.4)' },
  opened: { base: '#F97316', light: '#FDBA74', glow: 'rgba(249, 115, 22, 0.38)' },
  clicked: { base: '#2563EB', light: '#93C5FD', glow: 'rgba(37, 99, 235, 0.38)' },
  bounced: { base: '#EF4444', light: '#FCA5A5', glow: 'rgba(239, 68, 68, 0.35)' },
  replied: { base: '#10B981', light: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.38)' },
};

interface ContactStatusBarChartProps {
  items: EmailCampaignProgressRecipientStatus[];
}

interface ChartRow {
  status: string;
  label: string;
  count: number;
  percent: number;
  palette: { base: string; light: string; glow: string };
}

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <Box
      sx={{
        minWidth: 148,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
        boxShadow: `0 8px 24px color-mix(in srgb, var(--foreground) 10%, transparent), 0 0 0 1px ${row.palette.glow}`,
      }}
    >
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.75 }}>
        <Box
          className="h-2 w-2 rounded-full"
          sx={{
            bgcolor: row.palette.base,
            boxShadow: `0 0 8px ${row.palette.glow}`,
          }}
        />
        <Typography variant="caption" className="font-semibold">
          {row.label}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" className="block">
        {row.count.toLocaleString()} contacts
      </Typography>
      <Box
        sx={{
          mt: 1,
          height: 4,
          borderRadius: 999,
          bgcolor: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${row.percent}%`,
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${row.palette.base}, ${row.palette.light})`,
          }}
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        className="mt-0.5 block text-[10px]"
      >
        {row.percent}% of audience
      </Typography>
    </Box>
  );
}

function BarValueLabel(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
}) {
  const { x, y, width, value } = props;
  const numericValue = Number(value ?? 0);

  if (!numericValue || x == null || y == null || width == null) {
    return null;
  }

  const cx = Number(x) + Number(width) / 2;
  const cy = Number(y) - 6;

  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fill="var(--foreground)"
      fontSize={10}
      fontWeight={700}
      opacity={0.88}
    >
      {numericValue.toLocaleString()}
    </text>
  );
}

function EnhancedBar(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  payload?: ChartRow;
  index?: number;
  activeIndex?: number | null;
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload, index, activeIndex } = props;
  const row = payload;
  const isActive = activeIndex === index;
  const isDimmed = activeIndex != null && !isActive;

  const barH = Number(height);
  if (!row || barH <= 0) {
    return null;
  }

  const barX = Number(x);
  const barY = Number(y);
  const barW = Number(width);
  const radius = Math.min(8, barW / 2);

  return (
    <g opacity={isDimmed ? 0.45 : 1} style={{ transition: 'opacity 180ms ease' }}>
      <rect
        x={barX - 2}
        y={barY - 2}
        width={barW + 4}
        height={barH + 4}
        rx={radius + 2}
        fill={row.palette.glow}
        opacity={isActive ? 0.55 : 0.22}
      />
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barH}
        rx={radius}
        ry={radius}
        fill={`url(#status-gradient-${row.status})`}
        filter={`url(#status-shadow-${row.status})`}
      />
      {barH > 14 ? (
        <rect
          x={barX + 3}
          y={barY + 3}
          width={Math.max(barW - 6, 0)}
          height={Math.min(6, barH * 0.22)}
          rx={3}
          fill="rgba(255, 255, 255, 0.28)"
        />
      ) : null}
    </g>
  );
}

export default function ContactStatusBarChart({ items }: ContactStatusBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const rows: ChartRow[] = useMemo(
    () =>
      items.map((item) => ({
        status: item.status,
        label: item.label,
        count: item.count,
        percent: item.percent,
        palette: STATUS_PALETTE[item.status] ?? STATUS_PALETTE.pending,
      })),
    [items],
  );

  const maxCount = Math.max(...rows.map((row) => row.count), 1);

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          height: 196,
          borderRadius: 2,
          px: 0.5,
          py: 1,
          bgcolor: 'color-mix(in srgb, var(--foreground) 2.5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 16, right: 6, left: -16, bottom: 0 }}
            barCategoryGap="22%"
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              {rows.map((row) => (
                <g key={row.status}>
                  <linearGradient
                    id={`status-gradient-${row.status}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={row.palette.light} stopOpacity={1} />
                    <stop offset="45%" stopColor={row.palette.base} stopOpacity={1} />
                    <stop offset="100%" stopColor={row.palette.base} stopOpacity={0.82} />
                  </linearGradient>
                  <filter
                    id={`status-shadow-${row.status}`}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="3"
                      floodColor={row.palette.base}
                      floodOpacity="0.28"
                    />
                  </filter>
                </g>
              ))}
            </defs>
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
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, Math.ceil(maxCount * 1.15)]}
              tick={{ fill: 'var(--color-secondary)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<StatusTooltip />} cursor={false} />
            <Bar
              dataKey="count"
              maxBarSize={42}
              animationDuration={720}
              animationEasing="ease-out"
              shape={(props: BarShapeProps) => (
                <EnhancedBar
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  payload={props.payload as ChartRow}
                  index={props.index}
                  activeIndex={activeIndex}
                />
              )}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {rows.map((row) => (
                <Cell key={row.status} fill={row.palette.base} />
              ))}
              <LabelList dataKey="count" content={<BarValueLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ mt: 2, justifyContent: 'center', flexWrap: 'wrap', gap: 0.75 }}
      >
        {rows.map((row) => (
          <Box
            key={row.status}
            className="rounded-full px-2 py-0.5"
            sx={{
              bgcolor: `color-mix(in srgb, ${row.palette.base} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${row.palette.base} 18%, transparent)`,
            }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Box
                className="h-1.5 w-1.5 rounded-full"
                sx={{
                  bgcolor: row.palette.base,
                  boxShadow: row.count > 0 ? `0 0 6px ${row.palette.glow}` : 'none',
                }}
              />
              <Typography variant="caption" color="text.secondary" className="text-[10px]">
                {row.label} · {row.percent}%
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  type PieSectorDataItem,
} from 'recharts';
import type { MailboxSenderStatusSlice } from '@/lib/email/mailbox-overview-utils';

interface MailboxSenderStatusChartProps {
  slices: MailboxSenderStatusSlice[];
}

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MailboxSenderStatusSlice }[];
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const slice = payload[0].payload;

  return (
    <Box
      sx={{
        minWidth: 140,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
        boxShadow: `0 8px 24px color-mix(in srgb, var(--foreground) 10%, transparent), 0 0 0 1px ${slice.palette.glow}`,
      }}
    >
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.75 }}>
        <Box
          className="h-2 w-2 rounded-full"
          sx={{
            bgcolor: slice.palette.base,
            boxShadow: `0 0 8px ${slice.palette.glow}`,
          }}
        />
        <Typography variant="caption" className="font-semibold">
          {slice.label}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" className="block">
        {slice.count.toLocaleString()} assignment{slice.count === 1 ? '' : 's'} · {slice.percent}%
      </Typography>
    </Box>
  );
}

function ActiveSlice(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={Number(outerRadius) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
    </g>
  );
}

function LegendItem({ slice }: { slice: MailboxSenderStatusSlice }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: 'center',
        opacity: slice.count === 0 ? 0.55 : 1,
      }}
    >
      <Box
        className="h-2 w-2 shrink-0 rounded-full"
        sx={{
          bgcolor: slice.palette.base,
          boxShadow: slice.count > 0 ? `0 0 6px ${slice.palette.glow}` : 'none',
        }}
      />
      <Typography variant="caption" color="text.secondary" className="text-[10px] leading-tight">
        {slice.label}
        <Box component="span" className="block text-[9px] opacity-80">
          {slice.count.toLocaleString()} ({slice.percent}%)
        </Box>
      </Typography>
    </Stack>
  );
}

export default function MailboxSenderStatusChart({
  slices,
}: MailboxSenderStatusChartProps) {
  const chartSlices = useMemo(
    () => slices.filter((slice) => slice.count > 0),
    [slices],
  );
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const activeCount = slices.find((slice) => slice.status === 'active')?.count ?? 0;

  if (total === 0) {
    return (
      <Box className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <Typography variant="caption" color="text.secondary" className="max-w-sm">
          Sender status breakdown will appear once this mailbox is assigned to campaigns.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2,
          width: '100%',
          minHeight: 240,
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
          borderRadius: 2,
          bgcolor: 'color-mix(in srgb, var(--foreground) 2.5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: 180, sm: 200 },
            height: { xs: 180, sm: 200 },
            flexShrink: 0,
            mx: { xs: 'auto', sm: 0 },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartSlices.map((slice) => (
                  <linearGradient
                    key={slice.status}
                    id={`sender-status-gradient-${slice.status}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={slice.palette.light} stopOpacity={1} />
                    <stop offset="55%" stopColor={slice.palette.base} stopOpacity={1} />
                    <stop offset="100%" stopColor={slice.palette.base} stopOpacity={0.88} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartSlices}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="54%"
                outerRadius="88%"
                paddingAngle={chartSlices.length > 1 ? 3 : 0}
                stroke="var(--surface)"
                strokeWidth={2}
                animationDuration={720}
                animationEasing="ease-out"
                activeShape={ActiveSlice}
              >
                {chartSlices.map((slice) => (
                  <Cell
                    key={slice.status}
                    fill={`url(#sender-status-gradient-${slice.status})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="h6" className="text-lg font-bold leading-none">
              {activeCount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-0.5 text-[10px]">
              Active
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {slices.map((slice) => (
            <LegendItem key={slice.status} slice={slice} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

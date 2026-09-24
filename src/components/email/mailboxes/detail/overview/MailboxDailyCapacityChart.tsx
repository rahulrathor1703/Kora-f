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
import type { MailboxCapacitySlice } from '@/lib/email/mailbox-overview-utils';

interface MailboxDailyCapacityChartProps {
  slices: MailboxCapacitySlice[];
  dailyLimit: number;
}

function CapacityTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MailboxCapacitySlice }[];
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
        {slice.count.toLocaleString()} sends · {slice.percent}%
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
        outerRadius={Number(outerRadius) + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
    </g>
  );
}

export default function MailboxDailyCapacityChart({
  slices,
  dailyLimit,
}: MailboxDailyCapacityChartProps) {
  const chartSlices = useMemo(
    () => slices.filter((slice) => slice.count > 0),
    [slices],
  );
  const usedSlice = slices.find((slice) => slice.key === 'used');
  const usedPercent = usedSlice?.percent ?? 0;

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
            width: { xs: 200, sm: 220 },
            height: { xs: 200, sm: 220 },
            flexShrink: 0,
            mx: { xs: 'auto', sm: 0 },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartSlices.map((slice) => (
                  <linearGradient
                    key={slice.key}
                    id={`capacity-gradient-${slice.key}`}
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
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={chartSlices.length > 1 ? 2 : 0}
                stroke="var(--surface)"
                strokeWidth={2}
                animationDuration={720}
                animationEasing="ease-out"
                activeShape={ActiveSlice}
              >
                {chartSlices.map((slice) => (
                  <Cell
                    key={slice.key}
                    fill={`url(#capacity-gradient-${slice.key})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CapacityTooltip />} cursor={false} />
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
            <Typography variant="h5" className="font-bold leading-none">
              {usedPercent}%
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-0.5 text-[10px]">
              of daily limit
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {slices.map((slice) => (
            <Stack
              key={slice.key}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  sx={{
                    bgcolor: slice.palette.base,
                    boxShadow: slice.count > 0 ? `0 0 6px ${slice.palette.glow}` : 'none',
                  }}
                />
                <Typography variant="caption" color="text.secondary" className="text-[11px]">
                  {slice.label}
                </Typography>
              </Stack>
              <Typography variant="caption" className="text-[11px] font-semibold">
                {slice.count.toLocaleString()} / {dailyLimit.toLocaleString()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

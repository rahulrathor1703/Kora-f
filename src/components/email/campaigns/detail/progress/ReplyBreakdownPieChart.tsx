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
import type { EmailCampaignProgressReplyBreakdown } from '@/lib/email/campaigns/progress-types';

const REPLY_PALETTE: Record<
  string,
  { base: string; light: string; glow: string }
> = {
  interested: { base: '#10B981', light: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.38)' },
  not_now: { base: '#F59E0B', light: '#FCD34D', glow: 'rgba(245, 158, 11, 0.38)' },
  no: { base: '#EF4444', light: '#FCA5A5', glow: 'rgba(239, 68, 68, 0.35)' },
  ooo: { base: '#0EA5E9', light: '#7DD3FC', glow: 'rgba(14, 165, 233, 0.38)' },
  wrong_person: { base: '#64748B', light: '#94A3B8', glow: 'rgba(100, 116, 139, 0.32)' },
  no_reply_yet: { base: '#CBD5E1', light: '#E2E8F0', glow: 'rgba(203, 213, 225, 0.4)' },
};

interface ReplyBreakdownPieChartProps {
  items: EmailCampaignProgressReplyBreakdown[];
}

interface ChartSlice {
  category: string;
  label: string;
  count: number;
  percent: number;
  palette: { base: string; light: string; glow: string };
}

function ReplyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartSlice }[];
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
        {slice.count.toLocaleString()} contacts
      </Typography>
      <Typography variant="caption" color="text.secondary" className="mt-0.5 block text-[10px]">
        {slice.percent}% of audience
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
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Number(innerRadius) - 2}
        outerRadius={Number(outerRadius) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="rgba(255, 255, 255, 0.18)"
      />
    </g>
  );
}

function LegendItem({
  slice,
  align,
}: {
  slice: ChartSlice;
  align: 'left' | 'right';
}) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: 'center',
        justifyContent: align === 'left' ? 'flex-end' : 'flex-start',
        opacity: slice.count === 0 ? 0.55 : 1,
      }}
    >
      {align === 'left' ? (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            className="text-[10px] leading-tight"
            sx={{ textAlign: 'right' }}
          >
            {slice.label}
            <Box component="span" className="block text-[9px] opacity-80">
              {slice.count.toLocaleString()} ({slice.percent}%)
            </Box>
          </Typography>
          <Box
            className="h-2 w-2 shrink-0 rounded-full"
            sx={{
              bgcolor: slice.palette.base,
              boxShadow: slice.count > 0 ? `0 0 6px ${slice.palette.glow}` : 'none',
            }}
          />
        </>
      ) : (
        <>
          <Box
            className="h-2 w-2 shrink-0 rounded-full"
            sx={{
              bgcolor: slice.palette.base,
              boxShadow: slice.count > 0 ? `0 0 6px ${slice.palette.glow}` : 'none',
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            className="text-[10px] leading-tight"
            sx={{ textAlign: 'left' }}
          >
            {slice.label}
            <Box component="span" className="block text-[9px] opacity-80">
              {slice.count.toLocaleString()} ({slice.percent}%)
            </Box>
          </Typography>
        </>
      )}
    </Stack>
  );
}

export default function ReplyBreakdownPieChart({ items }: ReplyBreakdownPieChartProps) {
  const slices: ChartSlice[] = useMemo(
    () =>
      items.map((item) => ({
        category: item.category,
        label: item.label,
        count: item.count,
        percent: item.percent,
        palette: REPLY_PALETTE[item.category] ?? REPLY_PALETTE.no_reply_yet,
      })),
    [items],
  );

  const chartSlices = slices.filter((slice) => slice.count > 0);
  const totalAudience = slices.reduce((sum, slice) => sum + slice.count, 0);
  const totalReplies = slices
    .filter((slice) => slice.category !== 'no_reply_yet')
    .reduce((sum, slice) => sum + slice.count, 0);
  const replyRate =
    totalAudience > 0 ? Math.round((totalReplies / totalAudience) * 100) : 0;
  const legendSplit = Math.ceil(slices.length / 2);
  const leftLegend = slices.slice(0, legendSplit);
  const rightLegend = slices.slice(legendSplit);

  if (chartSlices.length === 0) {
    return (
      <Box className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <Typography variant="caption" color="text.secondary">
          Reply categories will appear here once responses arrive.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          width: '100%',
          minHeight: 260,
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
          borderRadius: 2,
          bgcolor: 'color-mix(in srgb, var(--foreground) 2.5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
        }}
      >
        <Stack
          spacing={1.25}
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          {leftLegend.map((slice) => (
            <LegendItem key={slice.category} slice={slice} align="left" />
          ))}
        </Stack>

        <Box
          sx={{
            position: 'relative',
            width: { xs: 200, sm: 220 },
            height: { xs: 200, sm: 220 },
            flexShrink: 0,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartSlices.map((slice) => (
                  <linearGradient
                    key={slice.category}
                    id={`reply-gradient-${slice.category}`}
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
                    key={slice.category}
                    fill={`url(#reply-gradient-${slice.category})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<ReplyTooltip />} cursor={false} />
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
              {totalReplies.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-0.5 text-[10px]">
              {totalReplies === 1 ? 'Reply' : 'Replies'}
            </Typography>
            {replyRate > 0 ? (
              <Typography
                variant="caption"
                className="mt-1 text-[10px] font-medium"
                sx={{ color: 'var(--theme-primary)' }}
              >
                {replyRate}% rate
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Stack
          spacing={1.25}
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          {rightLegend.map((slice) => (
            <LegendItem key={slice.category} slice={slice} align="right" />
          ))}
        </Stack>
      </Box>

      <Stack
        spacing={0.75}
        sx={{
          mt: 1.5,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        {slices.map((slice) => (
          <LegendItem key={slice.category} slice={slice} align="right" />
        ))}
      </Stack>
    </Box>
  );
}

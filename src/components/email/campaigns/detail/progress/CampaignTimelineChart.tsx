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
import {
  formatTooltipDateLabel,
  getDeliveryTrendAxisMax,
  getDeliveryTrendAxisTicks,
  getDeliveryTrendMaxValue,
  getDeliveryTrendXAxisInterval,
  type DeliveryTrendPoint,
} from '@/lib/email/campaigns/delivery-trend-chart-utils';

const DELIVERY_LINES = [
  {
    key: 'totalSent',
    label: 'Total sent',
    color: '#4338CA',
    marker: 'square',
    strokeWidth: 2.5,
  },
  {
    key: 'totalDelivered',
    label: 'Total delivered',
    color: '#0D9488',
    marker: 'circle',
    strokeWidth: 1.75,
  },
  {
    key: 'totalOpened',
    label: 'Total opened',
    color: '#F97316',
    marker: 'circle',
    strokeWidth: 1.75,
  },
  {
    key: 'totalClicked',
    label: 'Total clicked',
    color: '#0EA5E9',
    marker: 'circle',
    strokeWidth: 1.75,
  },
  {
    key: 'totalReplied',
    label: 'Total replied',
    color: '#10B981',
    marker: 'circle',
    strokeWidth: 1.75,
  },
  {
    key: 'totalBounced',
    label: 'Total bounced',
    color: '#EF4444',
    marker: 'circle',
    strokeWidth: 1.75,
  },
  {
    key: 'totalUnsubscribed',
    label: 'Total unsubscribed',
    color: '#64748B',
    marker: 'circle',
    strokeWidth: 1.75,
  },
] as const;

function getDeliveryLineOrder(dataKey: string): number {
  const index = DELIVERY_LINES.findIndex((line) => line.key === dataKey);
  return index === -1 ? DELIVERY_LINES.length : index;
}

function sortPayloadByDeliveryLineOrder<
  T extends { dataKey: string },
>(payload: T[]): T[] {
  return [...payload].sort(
    (left, right) =>
      getDeliveryLineOrder(left.dataKey) - getDeliveryLineOrder(right.dataKey),
  );
}

const EMBEDDED_CHART_THEME = {
  surface: '#0b1e2d',
  grid: 'rgba(148, 163, 184, 0.14)',
  axis: 'rgba(148, 163, 184, 0.85)',
  axisLine: 'rgba(148, 163, 184, 0.22)',
  legend: 'rgba(148, 163, 184, 0.92)',
} as const;

function DeliveryTrendLegend({ embedded }: { embedded: boolean }) {
  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={1.5}
      sx={{ pt: 2, rowGap: 0.75, flexWrap: 'wrap' }}
    >
      {DELIVERY_LINES.map((line) => (
        <Stack
          key={line.key}
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center' }}
        >
          <Box
            className="rounded-full"
            sx={{ width: 8, height: 8, bgcolor: line.color, flexShrink: 0 }}
          />
          <Typography
            variant="caption"
            color={embedded ? undefined : 'text.secondary'}
            sx={{
              fontSize: 10,
              ...(embedded ? { color: EMBEDDED_CHART_THEME.legend } : {}),
            }}
          >
            {line.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

interface CampaignTimelineChartProps {
  points: DeliveryTrendPoint[];
  totalContacts: number;
  variant?: 'panel' | 'embedded';
  height?: number;
}

interface MarkerDotProps {
  cx?: number;
  cy?: number;
  stroke?: string;
}

function SquareDot({
  cx,
  cy,
  stroke,
  fill = 'var(--surface)',
}: MarkerDotProps & { fill?: string }) {
  if (cx == null || cy == null || !stroke) {
    return null;
  }

  return (
    <rect
      x={cx - 3.5}
      y={cy - 3.5}
      width={7}
      height={7}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
    />
  );
}

function HollowDot({
  cx,
  cy,
  stroke,
  fill = 'var(--surface)',
}: MarkerDotProps & { fill?: string }) {
  if (cx == null || cy == null || !stroke) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
    />
  );
}

const EMBEDDED_TOOLTIP_THEME = {
  background: '#ffffff',
  title: '#0f172a',
  muted: '#64748b',
  value: '#0f172a',
  border: 'rgba(15, 23, 42, 0.12)',
  shadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
} as const;

function DeliveryTrendTooltip({
  active,
  payload,
  periodLabel = 'day',
  embedded = false,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string; payload: DeliveryTrendPoint }>;
  periodLabel?: 'day' | 'period';
  embedded?: boolean;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  const titleColor = embedded ? EMBEDDED_TOOLTIP_THEME.title : undefined;
  const mutedColor = embedded ? EMBEDDED_TOOLTIP_THEME.muted : undefined;
  const valueColor = embedded ? EMBEDDED_TOOLTIP_THEME.value : undefined;

  return (
    <Box
      className={embedded ? 'email-delivery-trend-tooltip' : undefined}
      sx={{
        minWidth: 176,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: embedded ? EMBEDDED_TOOLTIP_THEME.background : 'var(--surface)',
        border: embedded
          ? `1px solid ${EMBEDDED_TOOLTIP_THEME.border}`
          : '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
        boxShadow: embedded
          ? EMBEDDED_TOOLTIP_THEME.shadow
          : '0 8px 24px color-mix(in srgb, var(--foreground) 10%, transparent)',
        color: titleColor,
      }}
    >
      <Typography
        variant="caption"
        className="mb-1 block font-semibold"
        sx={{ color: titleColor }}
      >
        {formatTooltipDateLabel(point.date)}
      </Typography>
      {point.dailySent > 0 ? (
        <Typography
          variant="caption"
          color={embedded ? undefined : 'text.secondary'}
          className="mb-1 block text-[10px]"
          sx={{ color: mutedColor }}
        >
          +{point.dailySent.toLocaleString()} sent this {periodLabel}
        </Typography>
      ) : null}
      <Stack spacing={0.25}>
        {sortPayloadByDeliveryLineOrder(payload).map((entry) => (
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
              <Typography
                variant="caption"
                color={embedded ? undefined : 'text.secondary'}
                className="text-[10px]"
                sx={{ color: mutedColor }}
              >
                {DELIVERY_LINES.find((line) => line.key === entry.dataKey)?.label ??
                  entry.dataKey}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              className="text-[10px] font-semibold"
              sx={{ color: valueColor }}
            >
              {entry.value.toLocaleString()}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default function CampaignTimelineChart({
  points,
  totalContacts,
  variant = 'panel',
  height,
}: CampaignTimelineChartProps) {
  const embedded = variant === 'embedded';
  const chartHeight = height ?? (embedded ? 280 : 360);
  const markerFill = embedded ? EMBEDDED_CHART_THEME.surface : 'var(--surface)';

  const axisMax = useMemo(() => {
    const peakMetric = getDeliveryTrendMaxValue(points);
    return getDeliveryTrendAxisMax(totalContacts, peakMetric);
  }, [points, totalContacts]);

  const axisTicks = useMemo(() => getDeliveryTrendAxisTicks(axisMax), [axisMax]);

  const xAxisInterval = useMemo(
    () => getDeliveryTrendXAxisInterval(points.length),
    [points.length],
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: chartHeight,
        borderRadius: embedded ? 0 : 2,
        px: embedded ? 0 : 1.5,
        py: embedded ? 0 : 1.5,
        bgcolor: embedded ? 'transparent' : 'var(--surface)',
        border: embedded
          ? 'none'
          : '1px solid color-mix(in srgb, var(--foreground) 8%, transparent)',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 16, right: 12, left: 0, bottom: embedded ? 8 : 36 }}
        >
          <CartesianGrid
            stroke={
              embedded
                ? EMBEDDED_CHART_THEME.grid
                : 'color-mix(in srgb, var(--foreground) 10%, transparent)'
            }
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{
              fill: embedded ? EMBEDDED_CHART_THEME.axis : 'var(--color-secondary)',
              fontSize: 11,
              fontWeight: 500,
            }}
            axisLine={{
              stroke: embedded
                ? EMBEDDED_CHART_THEME.axisLine
                : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
            }}
            tickLine={false}
            interval={xAxisInterval}
            minTickGap={18}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, axisMax]}
            ticks={axisTicks}
            tick={{
              fill: embedded ? EMBEDDED_CHART_THEME.axis : 'var(--color-secondary)',
              fontSize: 11,
            }}
            axisLine={{
              stroke: embedded
                ? EMBEDDED_CHART_THEME.axisLine
                : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
            }}
            tickLine={false}
            width={embedded ? 32 : 40}
          />
          <Tooltip
            content={
              <DeliveryTrendTooltip
                periodLabel={embedded ? 'period' : 'day'}
                embedded={embedded}
              />
            }
          />
          <Legend content={<DeliveryTrendLegend embedded={embedded} />} />
          {DELIVERY_LINES.map((line) => (
            <Line
              key={line.key}
              type="linear"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              dot={
                line.marker === 'square'
                  ? ({ cx, cy }) => (
                      <SquareDot
                        cx={cx}
                        cy={cy}
                        stroke={line.color}
                        fill={markerFill}
                      />
                    )
                  : ({ cx, cy }) => (
                      <HollowDot
                        cx={cx}
                        cy={cy}
                        stroke={line.color}
                        fill={markerFill}
                      />
                    )
              }
              activeDot={{ r: 5, strokeWidth: 2, fill: markerFill }}
              animationDuration={720}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

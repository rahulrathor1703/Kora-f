'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

export const SEQUENCE_FUNNEL_CHART_COLORS = [
  '#818CF8',
  '#38BDF8',
  '#34D399',
  '#FBBF24',
  '#F87171',
  '#A78BFA',
  '#22D3EE',
  '#4ADE80',
];

export interface SequenceFunnelRow {
  key: string;
  label: string;
  count: number;
  percent: number;
}

interface SequenceFunnelChartProps {
  rows: SequenceFunnelRow[];
}

const SEGMENT_HEIGHT = 58;
const SEGMENT_OVERLAP = 1;
const MAX_BAR_WIDTH = 340;
const FUNNEL_CENTER_X = MAX_BAR_WIDTH / 2;
const LABEL_GUTTER = 168;

function buildTrapezoidPoints(
  centerX: number,
  y: number,
  topWidth: number,
  bottomWidth: number,
) {
  return [
    [centerX - topWidth / 2, y],
    [centerX + topWidth / 2, y],
    [centerX + bottomWidth / 2, y + SEGMENT_HEIGHT],
    [centerX - bottomWidth / 2, y + SEGMENT_HEIGHT],
  ]
    .map(([x, py]) => `${x},${py}`)
    .join(' ');
}

function toBarWidth(count: number, baseline: number) {
  const ratio = count / baseline;
  return Math.max(ratio * MAX_BAR_WIDTH, count > 0 ? 56 : 0);
}

export default function SequenceFunnelChart({ rows }: SequenceFunnelChartProps) {
  const baseline = useMemo(
    () => Math.max(rows[0]?.count ?? 0, 1),
    [rows],
  );

  const segments = useMemo(() => {
    return rows.map((row, index) => {
      const topWidth = toBarWidth(row.count, baseline);
      const nextCount = rows[index + 1]?.count;
      const isLast = index === rows.length - 1;
      const bottomWidth = isLast
        ? Math.max(toBarWidth(row.count, baseline) * 0.62, 40)
        : toBarWidth(nextCount ?? row.count, baseline);
      const y = index * (SEGMENT_HEIGHT - SEGMENT_OVERLAP);

      return {
        row,
        topWidth,
        bottomWidth,
        y,
        color:
          SEQUENCE_FUNNEL_CHART_COLORS[index % SEQUENCE_FUNNEL_CHART_COLORS.length],
        points: buildTrapezoidPoints(
          FUNNEL_CENTER_X,
          y,
          topWidth,
          bottomWidth,
        ),
      };
    });
  }, [rows, baseline]);

  const svgHeight =
    rows.length * SEGMENT_HEIGHT - Math.max(rows.length - 1, 0) * SEGMENT_OVERLAP;
  const svgWidth = MAX_BAR_WIDTH + LABEL_GUTTER;

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <svg
          width="100%"
          height={svgHeight + 16}
          viewBox={`0 0 ${svgWidth} ${svgHeight + 16}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Sequence tornado funnel chart"
          style={{ maxWidth: 560 }}
        >
          <line
            x1={FUNNEL_CENTER_X}
            y1={0}
            x2={FUNNEL_CENTER_X}
            y2={svgHeight + 8}
            stroke="color-mix(in srgb, var(--foreground) 12%, transparent)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {segments.map((segment) => (
            <g key={segment.row.key}>
              <title>
                {`${segment.row.label}: ${segment.row.count.toLocaleString()} (${segment.row.percent}% of audience)`}
              </title>
              <polygon
                points={segment.points}
                fill={segment.color}
                opacity={0.95}
                stroke="color-mix(in srgb, var(--foreground) 8%, transparent)"
                strokeWidth={1}
              />
              {segment.topWidth >= 72 ? (
                <text
                  x={FUNNEL_CENTER_X}
                  y={segment.y + SEGMENT_HEIGHT / 2 + 5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="700"
                >
                  {segment.row.count.toLocaleString()}
                </text>
              ) : null}
              <text
                x={FUNNEL_CENTER_X + segment.topWidth / 2 + 12}
                y={segment.y + SEGMENT_HEIGHT / 2 + 4}
                textAnchor="start"
                fill="var(--color-secondary)"
                fontSize="11"
                fontWeight="500"
              >
                {segment.row.label}
              </text>
              <text
                x={FUNNEL_CENTER_X + segment.topWidth / 2 + 12}
                y={segment.y + SEGMENT_HEIGHT / 2 + 17}
                textAnchor="start"
                fill="var(--color-secondary)"
                fontSize="10"
                opacity={0.85}
              >
                {segment.row.percent}% of audience
              </text>
            </g>
          ))}
        </svg>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 3, justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}
      >
        {rows.map((row, index) => (
          <Stack
            key={row.key}
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center' }}
          >
            <Box
              className="h-2 w-2 rounded-full"
              sx={{
                bgcolor:
                  SEQUENCE_FUNNEL_CHART_COLORS[
                    index % SEQUENCE_FUNNEL_CHART_COLORS.length
                  ],
              }}
            />
            <Typography variant="caption" color="text.secondary" className="text-[11px]">
              {row.label}: {row.count.toLocaleString()}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

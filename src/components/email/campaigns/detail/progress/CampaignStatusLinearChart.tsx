'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import type { EmailCampaignProgressDisposition } from '@/lib/email/campaigns/progress-types';

const DISPOSITION_PALETTE: Record<
  string,
  { base: string; light: string; glow: string }
> = {
  excluded: { base: '#64748B', light: '#94A3B8', glow: 'rgba(100, 116, 139, 0.32)' },
  paused: { base: '#F59E0B', light: '#FCD34D', glow: 'rgba(245, 158, 11, 0.38)' },
  stopped: { base: '#EF4444', light: '#FCA5A5', glow: 'rgba(239, 68, 68, 0.35)' },
  done: { base: '#0EA5E9', light: '#7DD3FC', glow: 'rgba(14, 165, 233, 0.38)' },
};

interface CampaignStatusLinearChartProps {
  items: EmailCampaignProgressDisposition[];
}

interface StatusRow {
  disposition: string;
  label: string;
  count: number;
  percent: number;
  palette: { base: string; light: string; glow: string };
}

export default function CampaignStatusLinearChart({
  items,
}: CampaignStatusLinearChartProps) {
  const total = useMemo(
    () => Math.max(items.reduce((sum, item) => sum + item.count, 0), 1),
    [items],
  );

  const rows: StatusRow[] = useMemo(
    () =>
      items.map((item) => ({
        disposition: item.disposition,
        label: item.label,
        count: item.count,
        percent: Math.round((item.count / total) * 100),
        palette: DISPOSITION_PALETTE[item.disposition] ?? DISPOSITION_PALETTE.excluded,
      })),
    [items, total],
  );

  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 2,
        px: 1.5,
        py: 1.5,
        bgcolor: 'color-mix(in srgb, var(--foreground) 2.5%, transparent)',
        border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
      }}
    >
      <Stack spacing={1.5}>
        {rows.map((row) => {
          const widthPercent = Math.max(row.percent, row.count > 0 ? 8 : 0);

          return (
            <Box key={row.disposition}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 0.5, alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                  <Box
                    className="h-2 w-2 shrink-0 rounded-full"
                    sx={{
                      bgcolor: row.palette.base,
                      boxShadow: row.count > 0 ? `0 0 6px ${row.palette.glow}` : 'none',
                    }}
                  />
                  <Typography variant="caption" className="truncate font-semibold">
                    {row.label}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" className="shrink-0 text-[10px]">
                  {row.count.toLocaleString()} contacts · {row.percent}%
                </Typography>
              </Stack>

              <Box
                className="relative overflow-hidden rounded-xl"
                sx={{
                  height: 36,
                  bgcolor: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
                }}
              >
                <Box
                  className="absolute inset-y-0 left-0 rounded-xl transition-[width] duration-700 ease-out"
                  sx={{
                    width: `${widthPercent}%`,
                    background: `linear-gradient(90deg, ${row.palette.base}, ${row.palette.light})`,
                    boxShadow: row.count > 0 ? `0 0 16px ${row.palette.glow}` : 'none',
                  }}
                />
                <Stack
                  direction="row"
                  sx={{
                    position: 'relative',
                    height: '100%',
                    px: 1.25,
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    className="font-bold"
                    sx={{
                      color: widthPercent > 35 ? '#FFFFFF' : 'var(--foreground)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {row.count.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

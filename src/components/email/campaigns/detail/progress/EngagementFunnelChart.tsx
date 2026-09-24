'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EngagementFunnelStep } from '@/lib/email/campaigns/engagement-funnel-utils';

interface EngagementFunnelChartProps {
  steps: EngagementFunnelStep[];
}

function DropOffBadge({ value }: { value: number | null }) {
  if (value === null || value <= 0) {
    return null;
  }

  return (
    <Typography
      variant="caption"
      className="rounded-full px-1.5 py-px text-[10px] font-medium"
      sx={{
        bgcolor: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
        color: 'var(--color-secondary)',
      }}
    >
      −{value}% drop-off
    </Typography>
  );
}

export default function EngagementFunnelChart({ steps }: EngagementFunnelChartProps) {
  return (
    <Stack spacing={1.5}>
      {steps.map((step, index) => {
        const widthPercent = Math.max(
          step.barPercent,
          step.barPercent > 0 ? 8 : 0,
        );

        return (
          <Box key={step.key}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 0.5, alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box
                  className="h-2 w-2 shrink-0 rounded-full"
                  sx={{
                    bgcolor: step.palette.base,
                    boxShadow: step.barPercent > 0 ? `0 0 6px ${step.palette.glow}` : 'none',
                  }}
                />
                <Typography variant="caption" className="truncate font-semibold">
                  {step.label}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', shrink: 0 }}>
                <DropOffBadge value={step.dropOffFromPrevious} />
                {step.rateLabel ? (
                  <Typography variant="caption" color="text.secondary" className="text-[10px]">
                    {step.rateLabel}
                  </Typography>
                ) : null}
              </Stack>
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
                  background: `linear-gradient(90deg, ${step.palette.base}, ${step.palette.light})`,
                  boxShadow: step.barPercent > 0 ? `0 0 16px ${step.palette.glow}` : 'none',
                }}
              />
              <Stack
                direction="row"
                sx={{
                  position: 'relative',
                  height: '100%',
                  px: 1.25,
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                  {step.displayValue}
                </Typography>
                {index < steps.length - 1 ? (
                  <Box
                    aria-hidden
                    className="absolute -bottom-2 left-1/2 h-2 w-px -translate-x-1/2"
                    sx={{ bgcolor: 'color-mix(in srgb, var(--foreground) 12%, transparent)' }}
                  />
                ) : null}
              </Stack>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

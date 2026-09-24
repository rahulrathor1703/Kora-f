'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import StageColorField from '@/components/crm/pipeline/StageColorField';
import type { BantTierThreshold } from '@/lib/crm/bant/types';

interface BantTierThresholdsEditorProps {
  tiers: BantTierThreshold[];
  onChange: (tiers: BantTierThreshold[]) => void;
  readOnly?: boolean;
}

export default function BantTierThresholdsEditor({
  tiers,
  onChange,
  readOnly = false,
}: BantTierThresholdsEditorProps) {
  const sortedTiers = [...tiers].sort((a, b) => a.sortOrder - b.sortOrder);

  function updateTier(id: string, patch: Partial<BantTierThreshold>) {
    onChange(
      tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)),
    );
  }

  return (
    <Stack spacing={2}>
      {sortedTiers.map((tier) => (
        <Box
          key={tier.id}
          className="rounded-2xl border border-border/60 bg-surface/40 p-4"
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' } }}
          >
            <TextField
              label="Tier label"
              size="small"
              value={tier.label}
              onChange={(event) =>
                updateTier(tier.id, { label: event.target.value })
              }
              disabled={readOnly}
              className="min-w-[160px]"
            />
            <TextField
              label="Value key"
              size="small"
              value={tier.value}
              onChange={(event) =>
                updateTier(tier.id, { value: event.target.value })
              }
              disabled={readOnly}
              className="min-w-[140px]"
            />
            <TextField
              label="Min score"
              size="small"
              type="number"
              value={tier.minScore}
              onChange={(event) =>
                updateTier(tier.id, {
                  minScore: Number(event.target.value),
                })
              }
              disabled={readOnly}
              slotProps={{ htmlInput: { min: 0, max: 100 } }}
              className="w-[120px]"
            />
            <TextField
              label="Max score"
              size="small"
              type="number"
              value={tier.maxScore}
              onChange={(event) =>
                updateTier(tier.id, {
                  maxScore: Number(event.target.value),
                })
              }
              disabled={readOnly}
              slotProps={{ htmlInput: { min: 0, max: 100 } }}
              className="w-[120px]"
            />
            {!readOnly ? (
              <StageColorField
                value={tier.color ?? '#6b7280'}
                onChange={(color) => updateTier(tier.id, { color })}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                {tier.color ?? 'Default color'}
              </Typography>
            )}
          </Stack>
        </Box>
      ))}

      <Typography variant="caption" color="text.secondary">
        Tier ranges must cover every score from 0 to 100 without overlap.
      </Typography>
    </Stack>
  );
}

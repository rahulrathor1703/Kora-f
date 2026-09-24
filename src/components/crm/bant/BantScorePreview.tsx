'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import {
  computeWeightedBantScore,
  getActiveCriteria,
  getScoreColor,
  getTierByValue,
  resolveBantTier,
} from '@/lib/crm/bant/scoring';
import type { BantResponses, BantSettingsConfig } from '@/lib/crm/bant/types';

interface BantScorePreviewProps {
  config: BantSettingsConfig;
}

function buildDefaultResponses(config: BantSettingsConfig): BantResponses {
  const responses: BantResponses = {};

  for (const criterion of getActiveCriteria(config.criteria)) {
    const firstActiveOption = criterion.options.find((option) => option.isActive);
    if (firstActiveOption) {
      responses[criterion.key] = firstActiveOption.value;
    }
  }

  return responses;
}

export default function BantScorePreview({ config }: BantScorePreviewProps) {
  const activeCriteria = getActiveCriteria(config.criteria);
  const [responses, setResponses] = useState(() => buildDefaultResponses(config));

  const score = useMemo(
    () => computeWeightedBantScore(config, responses),
    [config, responses],
  );
  const tierValue = resolveBantTier(score, config.tiers);
  const tier = getTierByValue(config.tiers, tierValue);

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Pick sample answers to preview how weights, option points, and tier
        thresholds combine into a score.
      </Typography>

      {activeCriteria.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Add at least one active criterion to preview scoring.
        </Typography>
      ) : (
        <>
          <Box className="grid gap-3 md:grid-cols-2">
            {activeCriteria.map((criterion) => (
              <TextField
                key={criterion.id}
                select
                size="small"
                label={criterion.label}
                value={responses[criterion.key] ?? ''}
                onChange={(event) =>
                  setResponses((current) => ({
                    ...current,
                    [criterion.key]: event.target.value,
                  }))
                }
              >
                {criterion.options
                  .filter((option) => option.isActive)
                  .map((option) => (
                    <MenuItem key={option.id} value={option.value}>
                      {option.label} ({option.points} pts)
                    </MenuItem>
                  ))}
              </TextField>
            ))}
          </Box>

          <Box className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4">
            {score !== null ? (
              <Box
                className="inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                sx={{
                  border: `2px solid ${getScoreColor(score)}`,
                  color: getScoreColor(score),
                }}
              >
                {score}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No score
              </Typography>
            )}

            {tier ? (
              <Chip
                label={tier.label}
                size="small"
                className="font-semibold"
                sx={
                  tier.color
                    ? {
                        bgcolor: `${tier.color}22`,
                        color: tier.color,
                        border: `1px solid ${tier.color}55`,
                      }
                    : undefined
                }
              />
            ) : null}

            <Typography variant="body2" color="text.secondary">
              Weighted average across active criteria
            </Typography>
          </Box>
        </>
      )}
    </Stack>
  );
}

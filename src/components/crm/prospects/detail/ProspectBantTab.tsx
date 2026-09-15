'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import FormAlert from '@/components/ui/FormAlert';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useProspectBant } from '@/hooks/useProspectBant';
import { getApiErrorMessage } from '@/lib/api';
import {
  computeWeightedBantScore,
  getActiveCriteria,
  getScoreColor,
  getTierByValue,
  resolveBantTier,
} from '@/lib/crm/bant/scoring';
import type { BantResponses } from '@/lib/crm/bant/types';

interface ProspectBantTabProps {
  prospectId: string;
  canUpdate: boolean;
  onSaved: () => void;
}

export default function ProspectBantTab({
  prospectId,
  canUpdate,
  onSaved,
}: ProspectBantTabProps) {
  const toOrgPath = useOrgPath();
  const canManageSettings = useHasPermission('bant-settings:manage');
  const canReadSettings = useHasPermission('bant-settings:read');
  const { notifyError, notifySuccess } = useNotify();
  const {
    config,
    responses: savedResponses,
    isLoading,
    isSaving,
    error,
    saveResponses,
  } = useProspectBant(prospectId);

  const [localResponses, setLocalResponses] = useState<BantResponses | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const responses = localResponses ?? savedResponses;

  const activeCriteria = useMemo(
    () => (config ? getActiveCriteria(config.criteria) : []),
    [config],
  );

  const previewScore = useMemo(
    () => (config ? computeWeightedBantScore(config, responses) : null),
    [config, responses],
  );

  const previewTierValue = useMemo(
    () =>
      config && previewScore !== null
        ? resolveBantTier(previewScore, config.tiers)
        : null,
    [config, previewScore],
  );

  const previewTier = useMemo(
    () =>
      config && previewTierValue
        ? getTierByValue(config.tiers, previewTierValue)
        : undefined,
    [config, previewTierValue],
  );

  const isDirty =
    localResponses !== null &&
    JSON.stringify(localResponses) !== JSON.stringify(savedResponses);

  async function handleSave() {
    setSubmitError(null);

    try {
      await saveResponses(responses);
      setLocalResponses(null);
      notifySuccess('BANT qualification saved.');
      onSaved();
    } catch (saveErr) {
      const message = getApiErrorMessage(saveErr, 'Unable to save BANT qualification.');
      setSubmitError(message);
      notifyError(message);
    }
  }

  if (isLoading) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return <FormAlert message={getApiErrorMessage(error, 'Unable to load BANT data.')} />;
  }

  if (!config || activeCriteria.length === 0) {
    return (
      <Alert severity="info">
        No BANT criteria are configured yet.
        {canReadSettings ? (
          <>
            {' '}
            <Link
              href={toOrgPath('/crm/configuration/bant-settings')}
              className="font-semibold underline"
            >
              Open BANT Settings
            </Link>
            {canManageSettings ? ' to set them up.' : '.'}
          </>
        ) : null}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4">
        {previewScore !== null ? (
          <Box
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
            sx={{
              border: `2px solid ${getScoreColor(previewScore)}`,
              color: getScoreColor(previewScore),
            }}
          >
            {previewScore}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select answers to calculate score
          </Typography>
        )}

        {previewTier ? (
          <Chip
            label={previewTier.label}
            size="small"
            className="font-semibold"
            sx={
              previewTier.color
                ? {
                    bgcolor: `${previewTier.color}22`,
                    color: previewTier.color,
                    border: `1px solid ${previewTier.color}55`,
                  }
                : undefined
            }
          />
        ) : null}

        <Typography variant="body2" color="text.secondary">
          Weighted score syncs to the prospect score and BANT tier fields.
        </Typography>
      </Box>

      <Box className="grid gap-4 md:grid-cols-2">
        {activeCriteria.map((criterion) => (
          <TextField
            key={criterion.id}
            select
            fullWidth
            label={criterion.label}
            value={responses[criterion.key] ?? ''}
            onChange={(event) =>
              setLocalResponses((current) => ({
                ...(current ?? savedResponses),
                [criterion.key]: event.target.value,
              }))
            }
            disabled={!canUpdate || isSaving}
            helperText={
              criterion.description
                ? `${criterion.description} · Weight ${criterion.weight}`
                : `Weight ${criterion.weight}`
            }
          >
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
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

      {submitError ? <FormAlert message={submitError} /> : null}

      {canUpdate ? (
        <Box className="flex justify-end">
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save BANT'}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}

'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import LogEngagementDialog from '@/components/crm/prospects/LogEngagementDialog';
import {
  useProspectEngagements,
  useProspectMutations,
} from '@/hooks/useProspects';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import { PIPELINE_STAGE_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import {
  PROSPECT_ENGAGEMENT_OUTCOME_LABELS,
  PROSPECT_ENGAGEMENT_TYPE_ICONS,
  PROSPECT_ENGAGEMENT_TYPE_LABELS,
} from '@/lib/crm/prospects/engagement-types';
import type {
  CreateProspectEngagementInput,
  Prospect,
  ProspectEngagement,
  ProspectFieldDefinition,
} from '@/lib/crm/prospects/types';

interface ProspectEngagementTabProps {
  prospect: Prospect;
  fields: ProspectFieldDefinition[];
  canUpdate: boolean;
  refreshToken: number;
  onEngagementLogged: () => void;
}

function formatEngagementTimestamp(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStageColor(
  fields: ProspectFieldDefinition[],
  stageValue: string | null,
): string | undefined {
  if (!stageValue) {
    return undefined;
  }

  const stageField = fields.find((field) => field.key === PIPELINE_STAGE_FIELD_KEY);
  return stageField?.options?.find((option) => option.value === stageValue)?.color;
}

function StageBadge({
  label,
  stageValue,
  fields,
}: {
  label: string;
  stageValue: string | null;
  fields: ProspectFieldDefinition[];
}) {
  const color = getStageColor(fields, stageValue);

  return (
    <Chip
      size="small"
      label={label}
      variant="outlined"
      className="font-semibold"
      sx={
        color
          ? {
              borderColor: color,
              color,
            }
          : undefined
      }
    />
  );
}

function EngagementMeta({
  engagement,
}: {
  engagement: ProspectEngagement;
}) {
  return (
    <Typography variant="caption" color="text.secondary">
      {engagement.createdByName} · {formatEngagementTimestamp(engagement.createdAt)}
    </Typography>
  );
}

function ManualEngagementItem({
  engagement,
}: {
  engagement: ProspectEngagement;
}) {
  return (
    <Box className="rounded-2xl border border-border/60 p-4">
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text-secondary">
          {PROSPECT_ENGAGEMENT_TYPE_ICONS[engagement.type]}
        </Box>
        <Stack spacing={1} className="min-w-0 flex-1">
          <Stack
            direction="row"
            spacing={1}
            className="flex-wrap items-center justify-between gap-y-1"
          >
            <Typography variant="subtitle2" className="font-bold">
              {PROSPECT_ENGAGEMENT_TYPE_LABELS[engagement.type]}
            </Typography>
            <Chip
              size="small"
              label={PROSPECT_ENGAGEMENT_OUTCOME_LABELS[engagement.outcome]}
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" className="whitespace-pre-wrap">
            {engagement.discussion}
          </Typography>
          {engagement.nextStep ? (
            <Typography variant="body2" color="text.secondary">
              Next step: {engagement.nextStep}
            </Typography>
          ) : null}
          <EngagementMeta engagement={engagement} />
        </Stack>
      </Stack>
    </Box>
  );
}

function StatusChangeEngagementItem({
  engagement,
  fields,
}: {
  engagement: ProspectEngagement;
  fields: ProspectFieldDefinition[];
}) {
  const fromLabel = engagement.fromStageLabel ?? 'Unassigned';
  const toLabel = engagement.toStageLabel ?? 'Unassigned';

  return (
    <Box className="rounded-2xl border border-border/60 p-4">
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text-secondary">
          {PROSPECT_ENGAGEMENT_TYPE_ICONS.status_change}
        </Box>
        <Stack spacing={1.25} className="min-w-0 flex-1">
          <Typography variant="subtitle2" className="font-bold">
            Status changed
          </Typography>
          <Stack direction="row" spacing={1} className="flex-wrap items-center">
            <StageBadge
              label={fromLabel}
              stageValue={engagement.fromStageValue}
              fields={fields}
            />
            <Typography variant="body2" color="text.secondary">
              to
            </Typography>
            <StageBadge
              label={toLabel}
              stageValue={engagement.toStageValue}
              fields={fields}
            />
          </Stack>
          <EngagementMeta engagement={engagement} />
        </Stack>
      </Stack>
    </Box>
  );
}

export default function ProspectEngagementTab({
  prospect,
  fields,
  canUpdate,
  refreshToken,
  onEngagementLogged,
}: ProspectEngagementTabProps) {
  const { notifyError, notifySuccess } = useNotify();
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const { createEngagement, isLoggingEngagement } = useProspectMutations();
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useProspectEngagements(prospect.id, refreshToken);
  const engagements = data ?? [];

  const initialProspect = useMemo(
    () => ({
      id: prospect.id,
      fullName: prospect.fullName,
      email: prospect.email,
    }),
    [prospect.email, prospect.fullName, prospect.id],
  );

  async function handleLogEngagement(
    prospectId: string,
    input: CreateProspectEngagementInput,
  ) {
    try {
      await createEngagement(prospectId, input);
      notifySuccess('Engagement logged');
      setLogDialogOpen(false);
      onEngagementLogged();
      await refetch();
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Failed to log engagement'));
      throw saveError;
    }
  }

  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent className="p-6">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            className="items-start justify-between"
          >
            <Box>
              <Typography variant="h6" className="font-bold">
                Engagement history
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Logged interactions and pipeline status changes, newest first.
              </Typography>
            </Box>
            {canUpdate ? (
              <Button
                variant="contained"
                onClick={() => setLogDialogOpen(true)}
                className="shrink-0"
              >
                Log engagement
              </Button>
            ) : null}
          </Stack>

          {error ? (
            <Alert severity="error" className="rounded-2xl">
              {error}
            </Alert>
          ) : null}

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading engagements…
            </Typography>
          ) : engagements.length === 0 ? (
            <Box className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
              <Typography variant="body1" className="font-semibold">
                No engagements yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Log a call, meeting, or email—or move this prospect on the pipeline—to
                see activity here.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {engagements.map((engagement) =>
                engagement.type === 'status_change' ? (
                  <StatusChangeEngagementItem
                    key={engagement.id}
                    engagement={engagement}
                    fields={fields}
                  />
                ) : (
                  <ManualEngagementItem key={engagement.id} engagement={engagement} />
                ),
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>

      {logDialogOpen ? (
        <LogEngagementDialog
          open
          initialProspect={initialProspect}
          isSubmitting={isLoggingEngagement}
          onClose={() => setLogDialogOpen(false)}
          onSubmit={handleLogEngagement}
        />
      ) : null}
    </Card>
  );
}

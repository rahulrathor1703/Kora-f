'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import CrmHubShell from '@/components/crm/CrmHubShell';
import FollowupCard from '@/components/crm/followups/FollowupCard';
import FollowupsToolbar from '@/components/crm/followups/FollowupsToolbar';
import { useFollowUps } from '@/hooks/useFollowUps';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import {
  useProspectFieldSchema,
  useProspectMutations,
} from '@/hooks/useProspects';
import { getApiErrorMessage } from '@/lib/api';
import {
  EMPTY_FOLLOW_UP_MESSAGES,
  NO_FOLLOW_UP_FIELD_MESSAGE,
  type FollowUpRange,
} from '@/lib/crm/followups/types';
import { resolveFollowUpFieldKey } from '@/lib/crm/followups/resolve-follow-up-field';
import type { CreateProspectEngagementInput, Prospect } from '@/lib/crm/prospects/types';

export default function FollowupsContent() {
  const { notifyError, notifySuccess } = useNotify();
  const canRead = useHasPermission('prospects:read');
  const canUpdate = useHasPermission('prospects:update');

  const [activeRange, setActiveRange] = useState<FollowUpRange>('today');
  const [page] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [expandedProspectId, setExpandedProspectId] = useState<string | null>(
    null,
  );
  const [expandedAction, setExpandedAction] = useState<
    'done' | 'reschedule' | null
  >(null);
  const [submittingProspectId, setSubmittingProspectId] = useState<
    string | null
  >(null);

  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useProspectFieldSchema();
  const {
    data: followUpsPage,
    isLoading: isFollowUpsLoading,
    error: followUpsError,
  } = useFollowUps(activeRange, page, 25, refreshToken);
  const {
    createEngagement,
    updateProspect,
    isLoggingEngagement,
    isUpdatingProspect,
  } = useProspectMutations();

  const fields = useMemo(() => fieldSchema?.fields ?? [], [fieldSchema]);
  const followUpFieldKey = useMemo(
    () => resolveFollowUpFieldKey(fields),
    [fields],
  );
  const prospects = followUpsPage?.items ?? [];
  const isLoading = isSchemaLoading || isFollowUpsLoading;
  const isSubmitting = isLoggingEngagement || isUpdatingProspect;

  function handleRangeChange(range: FollowUpRange) {
    setActiveRange(range);
    setExpandedProspectId(null);
    setExpandedAction(null);
  }

  function handleActionChange(
    prospectId: string,
    action: 'done' | 'reschedule' | null,
  ) {
    setExpandedProspectId(prospectId);
    setExpandedAction(action);
  }

  async function handleMarkDone(
    prospect: Prospect,
    input: CreateProspectEngagementInput,
  ) {
    if (!followUpFieldKey) {
      return;
    }

    setSubmittingProspectId(prospect.id);

    try {
      await createEngagement(prospect.id, input);
      await updateProspect(prospect.id, {
        values: { ...prospect.values, [followUpFieldKey]: null },
      });
      notifySuccess('Follow-up closed and engagement logged.');
      setExpandedProspectId(null);
      setExpandedAction(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to close follow-up.'));
    } finally {
      setSubmittingProspectId(null);
    }
  }

  async function handleReschedule(prospect: Prospect, newDate: string) {
    if (!followUpFieldKey) {
      return;
    }

    setSubmittingProspectId(prospect.id);

    try {
      await updateProspect(prospect.id, {
        values: { ...prospect.values, [followUpFieldKey]: newDate },
      });
      notifySuccess('Follow-up rescheduled.');
      setExpandedProspectId(null);
      setExpandedAction(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to reschedule follow-up.'));
    } finally {
      setSubmittingProspectId(null);
    }
  }

  if (!canRead) {
    return (
      <CrmHubShell>
        <Alert severity="warning">
          You do not have permission to view follow-ups.
        </Alert>
      </CrmHubShell>
    );
  }

  return (
    <CrmHubShell>
      <FollowupsToolbar
        activeRange={activeRange}
        onRangeChange={handleRangeChange}
      />

      {followUpsError ? (
        <Alert severity="error" className="mb-4">
          {getApiErrorMessage(followUpsError, 'Failed to load follow-ups.')}
        </Alert>
      ) : null}

      {!isSchemaLoading && !followUpFieldKey ? (
        <Box className="rounded-2xl border border-border/60 bg-surface/40 p-10 text-center">
          <Typography variant="body1" color="text.secondary">
            {NO_FOLLOW_UP_FIELD_MESSAGE}
          </Typography>
        </Box>
      ) : isLoading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress size={32} />
        </Box>
      ) : prospects.length === 0 ? (
        <Box className="rounded-2xl border border-border/60 bg-surface/40 p-10 text-center">
          <Typography variant="body1" color="text.secondary">
            {EMPTY_FOLLOW_UP_MESSAGES[activeRange]}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {prospects.map((prospect) => (
            <FollowupCard
              key={prospect.id}
              prospect={prospect}
              fields={fields}
              followUpFieldKey={followUpFieldKey ?? ''}
              canUpdate={canUpdate}
              activeAction={
                expandedProspectId === prospect.id ? expandedAction : null
              }
              isSubmitting={
                isSubmitting && submittingProspectId === prospect.id
              }
              onActionChange={(action) =>
                handleActionChange(prospect.id, action)
              }
              onMarkDone={(input) => handleMarkDone(prospect, input)}
              onReschedule={(newDate) => handleReschedule(prospect, newDate)}
            />
          ))}
        </Stack>
      )}
    </CrmHubShell>
  );
}

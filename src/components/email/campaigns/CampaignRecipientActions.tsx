'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PauseRecipientDialog from '@/components/email/campaigns/detail/PauseRecipientDialog';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { CampaignRecipientDisposition } from '@/lib/email/campaigns/recipient-types';
import {
  canExcludeRecipientGlobally,
  canPauseRecipient,
  canResumeRecipient,
  canStopRecipient,
} from '@/lib/email/campaigns/disposition-utils';

interface CampaignRecipientActionsProps {
  campaignId: string;
  recipientId: string;
  email: string;
  contactDisposition: CampaignRecipientDisposition;
  pausedUntil?: string | null;
  repliedAt?: string | null;
  globallyExcluded?: boolean;
  isUpdating?: boolean;
  onPause: (
    campaignId: string,
    recipientId: string,
    email: string,
    pausedUntil: string,
  ) => void;
  onStop: (campaignId: string, recipientId: string, email: string) => void;
  onResume: (campaignId: string, recipientId: string, email: string) => void;
  onExclude: (campaignId: string, recipientId: string, email: string) => void;
}

export default function CampaignRecipientActions({
  campaignId,
  recipientId,
  email,
  contactDisposition,
  pausedUntil = null,
  repliedAt = null,
  globallyExcluded = false,
  isUpdating = false,
  onPause,
  onStop,
  onResume,
  onExclude,
}: CampaignRecipientActionsProps) {
  const toOrgPath = useOrgPath();
  const [pauseOpen, setPauseOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [excludeOpen, setExcludeOpen] = useState(false);

  const isGloballyExcluded = globallyExcluded === true;
  const showPause = canPauseRecipient(contactDisposition);
  const showStop = canStopRecipient(contactDisposition);
  const showResume = canResumeRecipient(
    contactDisposition,
    pausedUntil,
    repliedAt,
  );
  const showExclude = canExcludeRecipientGlobally(
    contactDisposition,
    isGloballyExcluded,
  );
  const hasVisibleActions =
    showPause || showStop || showResume || showExclude;

  if (!hasVisibleActions) {
    const emptyLabel =
      contactDisposition === 'done'
        ? 'Sequence complete'
        : contactDisposition === 'unsubscribed'
          ? 'Unsubscribed'
          : isGloballyExcluded
            ? 'Excluded from all campaigns'
            : 'No actions available';

    return (
      <Stack
        spacing={0.5}
        sx={{ minWidth: 160, alignItems: 'flex-end', textAlign: 'right' }}
      >
        <Typography variant="caption" color="text.secondary">
          {emptyLabel}
        </Typography>
        {isGloballyExcluded ? (
          <Link
            component={NextLink}
            href={toOrgPath('/email/lists?tab=excluded')}
            variant="caption"
            underline="hover"
            onClick={(event) => event.stopPropagation()}
          >
            Manage exclusions
          </Link>
        ) : null}
      </Stack>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          minWidth: 220,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          rowGap: 0.5,
        }}
      >
        {isGloballyExcluded ? (
          <Chip
            label="Org excluded"
            size="small"
            color="warning"
            variant="outlined"
            className="rounded-lg"
          />
        ) : null}
        {showPause ? (
          <Button
            variant="outlined"
            size="small"
            disabled={isUpdating}
            sx={{ color: 'text.primary', borderColor: 'divider' }}
            className="rounded-lg normal-case"
            onClick={(event) => {
              event.stopPropagation();
              setPauseOpen(true);
            }}
          >
            Pause
          </Button>
        ) : null}
        {showResume ? (
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={isUpdating}
            className="rounded-lg normal-case"
            onClick={(event) => {
              event.stopPropagation();
              setResumeOpen(true);
            }}
          >
            {pausedUntil ? 'Resume' : 'Continue'}
          </Button>
        ) : null}
        {showStop ? (
          <Button
            variant="outlined"
            color="warning"
            size="small"
            disabled={isUpdating}
            className="rounded-lg normal-case"
            onClick={(event) => {
              event.stopPropagation();
              setStopOpen(true);
            }}
          >
            Stop
          </Button>
        ) : null}
        {showExclude ? (
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={isUpdating}
            className="rounded-lg normal-case"
            onClick={(event) => {
              event.stopPropagation();
              setExcludeOpen(true);
            }}
          >
            Exclude
          </Button>
        ) : null}
      </Stack>

      <PauseRecipientDialog
        open={pauseOpen}
        email={email}
        isSubmitting={isUpdating}
        onClose={() => setPauseOpen(false)}
        onConfirm={(nextPausedUntil) => {
          onPause(campaignId, recipientId, email, nextPausedUntil);
          setPauseOpen(false);
        }}
      />

      <ConfirmDialog
        open={resumeOpen}
        title={pausedUntil ? 'Resume campaign early' : 'Continue after reply'}
        description={
          pausedUntil ? (
            <>
              Resume outreach to <strong>{email}</strong> now instead of waiting
              until the scheduled date? The campaign will continue from the current
              step.
            </>
          ) : (
            <>
              Continue the campaign for <strong>{email}</strong>? Future sequence
              emails will send again from the current step
              {isGloballyExcluded ? (
                <>
                  {' '}
                  after you remove this address from the organization exclusion
                  list
                </>
              ) : (
                '.'
              )}
            </>
          )
        }
        confirmLabel={pausedUntil ? 'Resume now' : 'Continue'}
        isLoading={isUpdating}
        onClose={() => setResumeOpen(false)}
        onConfirm={() => {
          onResume(campaignId, recipientId, email);
          setResumeOpen(false);
        }}
      />

      <ConfirmDialog
        open={stopOpen}
        title="Stop for this campaign"
        description={
          <>
            Stop outreach to <strong>{email}</strong> in this campaign only. They can
            still receive emails from other campaigns unless they are on the
            organization exclusion list.
          </>
        }
        variant="warning"
        confirmLabel="Stop"
        isLoading={isUpdating}
        onClose={() => setStopOpen(false)}
        onConfirm={() => {
          onStop(campaignId, recipientId, email);
          setStopOpen(false);
        }}
      />

      <ConfirmDialog
        open={excludeOpen}
        title="Exclude from all campaigns"
        description={
          <>
            Exclude <strong>{email}</strong> from all future campaigns in this
            organization. This cannot be undone from here.
          </>
        }
        variant="destructive"
        confirmLabel="Exclude"
        isLoading={isUpdating}
        onClose={() => setExcludeOpen(false)}
        onConfirm={() => {
          onExclude(campaignId, recipientId, email);
          setExcludeOpen(false);
        }}
      />
    </>
  );
}

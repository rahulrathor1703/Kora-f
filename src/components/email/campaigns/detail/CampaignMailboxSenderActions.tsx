'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PauseLastMailboxSenderDialog from '@/components/email/campaigns/detail/PauseLastMailboxSenderDialog';
import StopLastMailboxSenderDialog from '@/components/email/campaigns/detail/StopLastMailboxSenderDialog';
import { canPauseCampaign } from '@/lib/email/campaigns/campaign-action-utils';
import {
  canEditMailboxSender,
  canPauseMailboxSender,
  canResumeMailboxSender,
  canStopMailboxSender,
  isLastActiveMailboxSender,
} from '@/lib/email/campaigns/mailbox-sender-utils';
import type {
  EmailCampaignMailboxSenderStatus,
  EmailCampaignStatus,
  PauseCampaignMailboxSenderInput,
  StopCampaignMailboxSenderInput,
} from '@/lib/email/campaigns/types';

interface CampaignMailboxSenderActionsProps {
  campaignId: string;
  campaignName: string;
  campaignStatus: EmailCampaignStatus;
  activeSenderCount: number;
  senderId: string;
  mailboxLabel: string;
  status: EmailCampaignMailboxSenderStatus;
  isUpdating?: boolean;
  onEdit: () => void;
  onPause: (
    campaignId: string,
    senderId: string,
    mailboxLabel: string,
    options?: PauseCampaignMailboxSenderInput,
  ) => void;
  onStop: (
    campaignId: string,
    senderId: string,
    mailboxLabel: string,
    options?: StopCampaignMailboxSenderInput,
  ) => void;
  onResume: (campaignId: string, senderId: string, mailboxLabel: string) => void;
}

export default function CampaignMailboxSenderActions({
  campaignId,
  campaignName,
  campaignStatus,
  activeSenderCount,
  senderId,
  mailboxLabel,
  status,
  isUpdating = false,
  onEdit,
  onPause,
  onStop,
  onResume,
}: CampaignMailboxSenderActionsProps) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseLastOpen, setPauseLastOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [stopLastOpen, setStopLastOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const showEdit = canEditMailboxSender(status);
  const showPause = canPauseMailboxSender(status);
  const showStop = canStopMailboxSender(status);
  const showResume = canResumeMailboxSender(status);
  const isLastActive = isLastActiveMailboxSender(status, activeSenderCount);
  const requiresCampaignPause =
    isLastActive && canPauseCampaign(campaignStatus);

  function handlePauseClick() {
    if (requiresCampaignPause) {
      setPauseLastOpen(true);
      return;
    }

    setPauseOpen(true);
  }

  function handleStopClick() {
    if (requiresCampaignPause) {
      setStopLastOpen(true);
      return;
    }

    setStopOpen(true);
  }

  if (status === 'stopped') {
    return (
      <Typography variant="caption" color="text.secondary">
        Removed from rotation
      </Typography>
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
        {status === 'paused' ? (
          <Chip
            label="Paused"
            size="small"
            color="warning"
            variant="outlined"
            className="rounded-lg"
          />
        ) : null}
        {showEdit ? (
          <Button
            variant="outlined"
            size="small"
            disabled={isUpdating}
            sx={{ color: 'text.primary', borderColor: 'divider' }}
            className="rounded-lg normal-case"
            onClick={onEdit}
          >
            Edit
          </Button>
        ) : null}
        {showPause ? (
          <Button
            variant="outlined"
            size="small"
            disabled={isUpdating}
            sx={{ color: 'text.primary', borderColor: 'divider' }}
            className="rounded-lg normal-case"
            onClick={handlePauseClick}
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
            onClick={() => setResumeOpen(true)}
          >
            Resume
          </Button>
        ) : null}
        {showStop ? (
          <Button
            variant="outlined"
            color="warning"
            size="small"
            disabled={isUpdating}
            className="rounded-lg normal-case"
            onClick={handleStopClick}
          >
            Stop
          </Button>
        ) : null}
      </Stack>

      <PauseLastMailboxSenderDialog
        open={pauseLastOpen}
        campaignName={campaignName}
        mailboxLabel={mailboxLabel}
        isSubmitting={isUpdating}
        onClose={() => setPauseLastOpen(false)}
        onConfirm={(pausedUntil) => {
          onPause(campaignId, senderId, mailboxLabel, {
            pauseCampaign: true,
            pausedUntil,
          });
          setPauseLastOpen(false);
        }}
      />

      <ConfirmDialog
        open={pauseOpen}
        title="Pause mailbox for this campaign"
        description={
          <>
            Pause <strong>{mailboxLabel}</strong>? Other active mailboxes will
            keep sending. Campaign progress stays where it is, and you can resume
            this mailbox manually when ready.
          </>
        }
        confirmLabel="Pause mailbox"
        isLoading={isUpdating}
        onClose={() => setPauseOpen(false)}
        onConfirm={() => {
          onPause(campaignId, senderId, mailboxLabel);
          setPauseOpen(false);
        }}
      />

      <ConfirmDialog
        open={resumeOpen}
        title="Resume mailbox"
        description={
          <>
            Resume <strong>{mailboxLabel}</strong> in this campaign? It will
            rejoin the send rotation from the current campaign progress.
          </>
        }
        confirmLabel="Resume mailbox"
        isLoading={isUpdating}
        onClose={() => setResumeOpen(false)}
        onConfirm={() => {
          onResume(campaignId, senderId, mailboxLabel);
          setResumeOpen(false);
        }}
      />

      <StopLastMailboxSenderDialog
        open={stopLastOpen}
        campaignName={campaignName}
        mailboxLabel={mailboxLabel}
        isSubmitting={isUpdating}
        onClose={() => setStopLastOpen(false)}
        onConfirm={() => {
          onStop(campaignId, senderId, mailboxLabel, {
            pauseCampaign: true,
          });
          setStopLastOpen(false);
        }}
      />

      <ConfirmDialog
        open={stopOpen}
        title="Stop mailbox for this campaign"
        description={
          <>
            Stop <strong>{mailboxLabel}</strong> for this campaign? It will be
            removed from future sends. Other mailboxes will continue, and
            recipient progress will not change.
          </>
        }
        variant="warning"
        confirmLabel="Stop mailbox"
        isLoading={isUpdating}
        onClose={() => setStopOpen(false)}
        onConfirm={() => {
          onStop(campaignId, senderId, mailboxLabel);
          setStopOpen(false);
        }}
      />
    </>
  );
}

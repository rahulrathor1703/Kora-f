'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PauseCampaignDialog from '@/components/email/campaigns/PauseCampaignDialog';
import ResumeCampaignWithPausedMailboxesDialog from '@/components/email/campaigns/ResumeCampaignWithPausedMailboxesDialog';
import ResumeCampaignAddMailboxDialog from '@/components/email/campaigns/ResumeCampaignAddMailboxDialog';
import {
  formatStatusLabel,
  STATUS_COLORS,
} from '@/lib/email/campaigns/detail-utils';
import {
  getCampaignStatusSelectOptions,
  getCampaignStatusSelectReadOnlyReason,
  getCampaignStatusLockedReason,
  resolveCampaignStatusSelectAction,
  type CampaignStatusSelectOptionValue,
} from '@/lib/email/campaigns/campaign-status-select-utils';
import {
  getPausedMailboxSenders,
  requiresAddMailboxForCampaignResume,
  requiresMailboxResumeForCampaignResume,
} from '@/lib/email/campaigns/mailbox-sender-utils';
import type {
  EmailCampaignMailboxSender,
  EmailCampaignStatus,
  EmailCampaignStatusBeforePause,
  ResumeEmailCampaignInput,
} from '@/lib/email/campaigns/types';

function StatusChipLabel({
  label,
  showArrow,
  iconSize,
}: {
  label: string;
  showArrow: boolean;
  iconSize: number;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.25}
      sx={{ alignItems: 'center', lineHeight: 1 }}
      className="capitalize"
    >
      <span>{label}</span>
      {showArrow ? (
        <KeyboardArrowDownIcon sx={{ fontSize: iconSize, opacity: 0.9, color: 'inherit' }} />
      ) : null}
    </Stack>
  );
}

function CampaignStatusChip({
  status,
  size,
  showArrow,
  iconSize,
  className,
}: {
  status: EmailCampaignStatus;
  size: 'small' | 'medium';
  showArrow: boolean;
  iconSize: number;
  className?: string;
}) {
  return (
    <Chip
      label={
        <StatusChipLabel
          label={formatStatusLabel(status)}
          showArrow={showArrow}
          iconSize={iconSize}
        />
      }
      color={STATUS_COLORS[status]}
      size={size}
      className={className ?? 'rounded-lg'}
    />
  );
}

interface CampaignStatusSelectProps {
  campaignName: string;
  status: EmailCampaignStatus;
  mailboxSenders?: EmailCampaignMailboxSender[];
  pausedUntil?: string | null;
  statusBeforePause?: EmailCampaignStatusBeforePause | null;
  canUpdate?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  className?: string;
  showPausedUntil?: boolean;
  formatPausedUntil?: (value: string) => string;
  isUpdating?: boolean;
  onStatusChange: (status: EmailCampaignStatus) => void | Promise<void>;
  onPause: (pausedUntil: string) => void | Promise<void>;
  onStop: () => void | Promise<void>;
  onResume: (options?: ResumeEmailCampaignInput) => void | Promise<void>;
}

export default function CampaignStatusSelect({
  campaignName,
  status,
  mailboxSenders = [],
  pausedUntil = null,
  statusBeforePause = null,
  canUpdate = false,
  disabled = false,
  size = 'small',
  className,
  showPausedUntil = false,
  formatPausedUntil,
  isUpdating = false,
  onStatusChange,
  onPause,
  onStop,
  onResume,
}: CampaignStatusSelectProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeWithMailboxesOpen, setResumeWithMailboxesOpen] = useState(false);
  const [addMailboxRequiredOpen, setAddMailboxRequiredOpen] = useState(false);

  const options = getCampaignStatusSelectOptions(status, statusBeforePause);
  const hasTransitions = options.length > 1;
  const readOnlyReason = getCampaignStatusSelectReadOnlyReason(canUpdate);
  const lockedReason = getCampaignStatusLockedReason(status);
  const isBusy = disabled || isUpdating;
  const arrowIconSize = size === 'small' ? 16 : 18;
  const menuOpen = Boolean(menuAnchor);
  const isInteractive = canUpdate && hasTransitions && !isBusy;
  const requiresAddMailbox = requiresAddMailboxForCampaignResume(mailboxSenders);
  const requiresMailboxResume = requiresMailboxResumeForCampaignResume(
    mailboxSenders,
  );
  const pausedMailboxLabels = getPausedMailboxSenders(mailboxSenders).map(
    (sender) => sender.senderEmail,
  );

  function openResumeDialog() {
    if (requiresAddMailbox) {
      setAddMailboxRequiredOpen(true);
      return;
    }

    if (requiresMailboxResume) {
      setResumeWithMailboxesOpen(true);
      return;
    }

    setResumeOpen(true);
  }

  function closeMenu() {
    setMenuAnchor(null);
  }

  async function runAction(action: ReturnType<typeof resolveCampaignStatusSelectAction>) {
    if (!action) {
      return;
    }

    if (action.kind === 'status') {
      await onStatusChange(action.value);
      return;
    }

    if (action.kind === 'pause') {
      setPauseOpen(true);
      return;
    }

    if (action.kind === 'stop') {
      setStopOpen(true);
      return;
    }

    openResumeDialog();
  }

  function handleSelectOption(selected: CampaignStatusSelectOptionValue) {
    closeMenu();
    const action = resolveCampaignStatusSelectAction(status, selected);
    void runAction(action);
  }

  function renderPausedUntilCaption() {
    if (!showPausedUntil || status !== 'paused' || !pausedUntil) {
      return null;
    }

    return (
      <Typography variant="caption" color="text.secondary">
        until {formatPausedUntil?.(pausedUntil) ?? pausedUntil}
      </Typography>
    );
  }

  if (readOnlyReason) {
    return (
      <Tooltip title={readOnlyReason}>
        <Stack spacing={0.25}>
          <CampaignStatusChip
            status={status}
            size={size}
            showArrow={false}
            iconSize={arrowIconSize}
            className={className}
          />
          {renderPausedUntilCaption()}
        </Stack>
      </Tooltip>
    );
  }

  const chipControl = (
    <Stack spacing={0.25}>
      <Box
        component="span"
        onClick={(event) => {
          event.stopPropagation();
          if (isInteractive) {
            setMenuAnchor(event.currentTarget);
          }
        }}
        sx={{
          display: 'inline-flex',
          cursor: isInteractive ? 'pointer' : 'default',
          verticalAlign: 'middle',
        }}
      >
        <CampaignStatusChip
          status={status}
          size={size}
          showArrow
          iconSize={arrowIconSize}
          className={className}
        />
      </Box>
      {renderPausedUntilCaption()}
    </Stack>
  );

  return (
    <>
      {!hasTransitions && lockedReason ? (
        <Tooltip title={lockedReason}>{chipControl}</Tooltip>
      ) : (
        chipControl
      )}

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        onClick={(event) => event.stopPropagation()}
      >
        {options
          .filter((option) => !option.isCurrent)
          .map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleSelectOption(option.value)}
              className="capitalize"
            >
              <Chip
                label={option.label}
                color={option.color}
                size="small"
                className="rounded-lg"
              />
            </MenuItem>
          ))}
      </Menu>

      <PauseCampaignDialog
        open={pauseOpen}
        campaignName={campaignName}
        isSubmitting={isUpdating}
        onClose={() => setPauseOpen(false)}
        onConfirm={(pausedUntilValue) => {
          void onPause(pausedUntilValue);
          setPauseOpen(false);
        }}
      />

      <ConfirmDialog
        open={stopOpen}
        title="Stop campaign"
        description={
          <>
            Stop <strong>{campaignName}</strong> permanently? No further emails will
            be sent from this campaign.
          </>
        }
        variant="warning"
        confirmLabel="Stop"
        isLoading={isUpdating}
        onClose={() => setStopOpen(false)}
        onConfirm={() => {
          void onStop();
          setStopOpen(false);
        }}
      />

      <ResumeCampaignAddMailboxDialog
        open={addMailboxRequiredOpen}
        campaignName={campaignName}
        onClose={() => setAddMailboxRequiredOpen(false)}
      />

      <ResumeCampaignWithPausedMailboxesDialog
        open={resumeWithMailboxesOpen}
        campaignName={campaignName}
        pausedMailboxLabels={pausedMailboxLabels}
        isSubmitting={isUpdating}
        onClose={() => setResumeWithMailboxesOpen(false)}
        onConfirm={() => {
          void onResume({ resumePausedMailboxSenders: true });
          setResumeWithMailboxesOpen(false);
        }}
      />

      <ConfirmDialog
        open={resumeOpen}
        title="Resume campaign"
        description={
          <>
            Resume <strong>{campaignName}</strong> now? Sending will continue from
            where it left off.
          </>
        }
        confirmLabel="Resume"
        isLoading={isUpdating}
        onClose={() => setResumeOpen(false)}
        onConfirm={() => {
          void onResume();
          setResumeOpen(false);
        }}
      />
    </>
  );
}

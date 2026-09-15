'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import StopOutlinedIcon from '@mui/icons-material/StopOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PauseCampaignDialog from '@/components/email/campaigns/PauseCampaignDialog';
import ResumeCampaignWithPausedMailboxesDialog from '@/components/email/campaigns/ResumeCampaignWithPausedMailboxesDialog';
import ResumeCampaignAddMailboxDialog from '@/components/email/campaigns/ResumeCampaignAddMailboxDialog';
import {
  canPauseCampaign,
  canResumeCampaign,
  canStopCampaign,
  hasVisibleCampaignActions,
} from '@/lib/email/campaigns/campaign-action-utils';
import {
  getPausedMailboxSenders,
  requiresAddMailboxForCampaignResume,
  requiresMailboxResumeForCampaignResume,
} from '@/lib/email/campaigns/mailbox-sender-utils';
import type { EmailCampaign, ResumeEmailCampaignInput } from '@/lib/email/campaigns/types';

interface CampaignRowActionsProps {
  campaign: EmailCampaign;
  isUpdating?: boolean;
  canDirectDelete?: boolean;
  canRequestDelete?: boolean;
  hasPendingDeleteRequest?: boolean;
  onPause: (campaignId: string, name: string, pausedUntil: string) => void;
  onStop: (campaignId: string, name: string) => void;
  onResume: (
    campaignId: string,
    name: string,
    options?: ResumeEmailCampaignInput,
  ) => void;
  onDirectDelete?: (campaign: EmailCampaign) => void;
  onRequestDelete?: (campaign: EmailCampaign) => void;
}

export default function CampaignRowActions({
  campaign,
  isUpdating = false,
  canDirectDelete = false,
  canRequestDelete = false,
  hasPendingDeleteRequest = false,
  onPause,
  onStop,
  onResume,
  onDirectDelete,
  onRequestDelete,
}: CampaignRowActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeWithMailboxesOpen, setResumeWithMailboxesOpen] = useState(false);
  const [addMailboxRequiredOpen, setAddMailboxRequiredOpen] = useState(false);

  const menuOpen = Boolean(menuAnchor);
  const showPause = canPauseCampaign(campaign.status);
  const showStop = canStopCampaign(campaign.status);
  const showResume = canResumeCampaign(campaign.status);
  const hasLifecycleActions = hasVisibleCampaignActions(campaign.status);
  const hasDeleteActions = canDirectDelete || canRequestDelete;
  const isBusy = isUpdating;
  const requiresAddMailbox = requiresAddMailboxForCampaignResume(
    campaign.mailboxSenders ?? [],
  );
  const requiresMailboxResume = requiresMailboxResumeForCampaignResume(
    campaign.mailboxSenders ?? [],
  );
  const pausedMailboxLabels = getPausedMailboxSenders(
    campaign.mailboxSenders ?? [],
  ).map((sender) => sender.senderEmail);

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

  if (!hasLifecycleActions && !hasDeleteActions) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions for ${campaign.name}`}
        disabled={isBusy}
        onClick={(event) => {
          event.stopPropagation();
          setMenuAnchor(event.currentTarget);
        }}
      >
        <MoreVertOutlinedIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        onClick={(event) => event.stopPropagation()}
      >
        {showPause ? (
          <MenuItem
            onClick={() => {
              closeMenu();
              setPauseOpen(true);
            }}
          >
            <ListItemIcon>
              <PauseOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pause campaign</ListItemText>
          </MenuItem>
        ) : null}

        {showResume ? (
          <MenuItem
            onClick={() => {
              closeMenu();
              openResumeDialog();
            }}
          >
            <ListItemIcon>
              <PlayArrowOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resume campaign</ListItemText>
          </MenuItem>
        ) : null}

        {showStop ? (
          <MenuItem
            onClick={() => {
              closeMenu();
              setStopOpen(true);
            }}
          >
            <ListItemIcon>
              <StopOutlinedIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Stop campaign</ListItemText>
          </MenuItem>
        ) : null}

        {canDirectDelete ? (
          <MenuItem
            onClick={() => {
              closeMenu();
              onDirectDelete?.(campaign);
            }}
          >
            <ListItemIcon>
              <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        ) : null}

        {canRequestDelete ? (
          <MenuItem
            disabled={hasPendingDeleteRequest}
            onClick={() => {
              closeMenu();
              onRequestDelete?.(campaign);
            }}
          >
            <ListItemIcon>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {hasPendingDeleteRequest
                ? 'Delete request pending'
                : 'Request delete'}
            </ListItemText>
          </MenuItem>
        ) : null}
      </Menu>

      <PauseCampaignDialog
        open={pauseOpen}
        campaignName={campaign.name}
        isSubmitting={isUpdating}
        onClose={() => setPauseOpen(false)}
        onConfirm={(pausedUntil) => {
          onPause(campaign.id, campaign.name, pausedUntil);
          setPauseOpen(false);
        }}
      />

      <ResumeCampaignAddMailboxDialog
        open={addMailboxRequiredOpen}
        campaignName={campaign.name}
        onClose={() => setAddMailboxRequiredOpen(false)}
      />

      <ResumeCampaignWithPausedMailboxesDialog
        open={resumeWithMailboxesOpen}
        campaignName={campaign.name}
        pausedMailboxLabels={pausedMailboxLabels}
        isSubmitting={isUpdating}
        onClose={() => setResumeWithMailboxesOpen(false)}
        onConfirm={() => {
          onResume(campaign.id, campaign.name, {
            resumePausedMailboxSenders: true,
          });
          setResumeWithMailboxesOpen(false);
        }}
      />

      <ConfirmDialog
        open={resumeOpen}
        title="Resume campaign"
        description={
          <>
            Resume <strong>{campaign.name}</strong> now? Sending will continue from
            where it left off.
          </>
        }
        confirmLabel="Resume"
        isLoading={isUpdating}
        onClose={() => setResumeOpen(false)}
        onConfirm={() => {
          onResume(campaign.id, campaign.name);
          setResumeOpen(false);
        }}
      />

      <ConfirmDialog
        open={stopOpen}
        title="Stop campaign"
        description={
          <>
            Stop <strong>{campaign.name}</strong> permanently? No further emails will
            be sent from this campaign.
          </>
        }
        variant="warning"
        confirmLabel="Stop"
        isLoading={isUpdating}
        onClose={() => setStopOpen(false)}
        onConfirm={() => {
          onStop(campaign.id, campaign.name);
          setStopOpen(false);
        }}
      />
    </>
  );
}

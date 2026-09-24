'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ResumeCampaignWithPausedMailboxesDialogProps {
  open: boolean;
  campaignName: string;
  pausedMailboxLabels: string[];
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function formatMailboxList(labels: string[]): string {
  if (labels.length === 1) {
    return labels[0] ?? 'this mailbox';
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`;
}

export default function ResumeCampaignWithPausedMailboxesDialog({
  open,
  campaignName,
  pausedMailboxLabels,
  isSubmitting = false,
  onClose,
  onConfirm,
}: ResumeCampaignWithPausedMailboxesDialogProps) {
  const mailboxList = formatMailboxList(pausedMailboxLabels);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold">Resume paused mailboxes?</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            <strong>{campaignName}</strong> has no active mailboxes. Resuming
            the campaign now requires reactivating{' '}
            {pausedMailboxLabels.length === 1 ? (
              <>
                <strong>{mailboxList}</strong>
              </>
            ) : (
              <>the paused mailboxes: {mailboxList}</>
            )}
            .
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Sending will stay paused until at least one mailbox is active again.
            Resume the campaign together with{' '}
            {pausedMailboxLabels.length === 1 ? 'this mailbox' : 'these mailboxes'}?
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          color="inherit"
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={isSubmitting}
          className="rounded-xl"
          onClick={onConfirm}
        >
          Resume campaign and mailboxes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

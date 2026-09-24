'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface StopLastMailboxSenderDialogProps {
  open: boolean;
  campaignName: string;
  mailboxLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function StopLastMailboxSenderDialog({
  open,
  campaignName,
  mailboxLabel,
  isSubmitting = false,
  onClose,
  onConfirm,
}: StopLastMailboxSenderDialogProps) {
  function handleClose() {
    if (isSubmitting) {
      return;
    }

    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold">Stop last active mailbox?</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            Stopping <strong>{mailboxLabel}</strong> will remove the last active
            sender from <strong>{campaignName}</strong>. The campaign will be
            paused and cannot resume until you add a mailbox.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Stopped mailboxes cannot be reactivated. Add a new mailbox later if
            you want to resume sending.
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
          color="warning"
          disabled={isSubmitting}
          className="rounded-xl"
          onClick={onConfirm}
        >
          Stop mailbox and pause campaign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

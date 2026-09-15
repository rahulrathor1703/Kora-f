'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CAMPAIGN_RESUME_REQUIRES_MAILBOX_MESSAGE } from '@/lib/email/campaigns/mailbox-sender-utils';

interface ResumeCampaignAddMailboxDialogProps {
  open: boolean;
  campaignName: string;
  onClose: () => void;
}

export default function ResumeCampaignAddMailboxDialog({
  open,
  campaignName,
  onClose,
}: ResumeCampaignAddMailboxDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold">Add a mailbox first</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            <strong>{campaignName}</strong> has no active or paused mailboxes left
            to send from.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {CAMPAIGN_RESUME_REQUIRES_MAILBOX_MESSAGE}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button variant="contained" onClick={onClose} className="rounded-xl">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}

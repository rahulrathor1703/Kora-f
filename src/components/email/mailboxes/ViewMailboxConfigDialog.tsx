'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MailboxConnectionDetails from '@/components/email/mailboxes/MailboxConnectionDetails';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

interface ViewMailboxConfigDialogProps {
  mailbox: SenderMailbox | null;
  onClose: () => void;
}

export default function ViewMailboxConfigDialog({
  mailbox,
  onClose,
}: ViewMailboxConfigDialogProps) {
  return (
    <Dialog
      open={Boolean(mailbox)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          className: 'rounded-[24px]',
        },
      }}
    >
      <DialogTitle className="font-bold">Mailbox configuration</DialogTitle>
      <DialogContent>
        {mailbox ? <MailboxConnectionDetails mailbox={mailbox} /> : null}
      </DialogContent>
      <DialogActions className="px-6 pb-6">
        <Button onClick={onClose} className="rounded-2xl px-4">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

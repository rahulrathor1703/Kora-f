'use client';

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

interface TestMailboxConnectionDialogProps {
  mailbox: SenderMailbox | null;
  isSending: boolean;
  onClose: () => void;
  onSend: (to: string) => Promise<void>;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function TestMailboxConnectionDialog({
  mailbox,
  isSending,
  onClose,
  onSend,
}: TestMailboxConnectionDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setRecipientEmail('');
    setError(null);
  }

  function handleClose() {
    if (isSending) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSend() {
    const trimmed = recipientEmail.trim();

    if (!isValidEmail(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);
    await onSend(trimmed);
  }

  return (
    <Dialog
      key={mailbox?.id ?? 'closed'}
      open={Boolean(mailbox)}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: { className: 'rounded-2xl' },
      }}
    >
      <DialogTitle className="font-bold">Test connection</DialogTitle>
      <DialogContent className="flex flex-col gap-3 pt-1">
        <Typography variant="body2" color="text.secondary">
          Send a test email from{' '}
          <Typography component="span" variant="body2" className="font-medium" color="text.primary">
            {mailbox?.email}
          </Typography>{' '}
          to verify the mailbox can send mail.
        </Typography>
        <TextField
          autoFocus
          label="Recipient email"
          type="email"
          value={recipientEmail}
          onChange={(event) => {
            setRecipientEmail(event.target.value);
            if (error) {
              setError(null);
            }
          }}
          error={Boolean(error)}
          helperText={error ?? 'Enter the address that should receive the test email.'}
          disabled={isSending}
          fullWidth
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !isSending) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button onClick={handleClose} disabled={isSending} className="rounded-xl normal-case">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : <SendOutlinedIcon />}
          onClick={() => void handleSend()}
          disabled={isSending || !recipientEmail.trim()}
          className="rounded-xl normal-case shadow-primary-soft"
        >
          {isSending ? 'Sending…' : 'Send test email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

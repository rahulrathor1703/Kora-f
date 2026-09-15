'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import type { CreateAudienceContactInput } from '@/lib/api/services/email-excluded.service';

interface AddAudienceContactDialogProps {
  open: boolean;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CreateAudienceContactInput) => Promise<void>;
}

export default function AddAudienceContactDialog({
  open,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AddAudienceContactDialogProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function resetForm() {
    setEmail('');
    setFirstName('');
    setLastName('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    await onSubmit({
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });
    resetForm();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add contact</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            fullWidth
          />
          {error ? (
            <Alert severity="error" className="rounded-2xl">
              {error}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !email.trim()}
          className="rounded-xl"
        >
          Add contact
        </Button>
      </DialogActions>
    </Dialog>
  );
}

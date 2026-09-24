'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { rejectProspectDeleteRequestSchema } from '@/lib/schemas/prospect-delete-request';

interface RejectProspectDeleteRequestDialogProps {
  open: boolean;
  prospectName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reviewNote?: string) => Promise<void>;
}

export default function RejectProspectDeleteRequestDialog({
  open,
  prospectName,
  isSubmitting,
  onClose,
  onSubmit,
}: RejectProspectDeleteRequestDialogProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setReviewNote('');
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    const validation = rejectProspectDeleteRequestSchema.safeParse({
      reviewNote: reviewNote.trim() || undefined,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid note');
      return;
    }

    setError(null);

    try {
      await onSubmit(validation.data.reviewNote);
      setReviewNote('');
      onClose();
    } catch {
      // Caller handles notification.
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Reject delete request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          <Typography variant="body2" color="text.secondary">
            Reject the delete request for{' '}
            <strong>{prospectName || 'this prospect'}</strong>. The prospect will
            remain in the system.
          </Typography>
          <TextField
            label="Review note (optional)"
            value={reviewNote}
            onChange={(event) => {
              setReviewNote(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            multiline
            minRows={3}
            fullWidth
            error={Boolean(error)}
            helperText={error}
            disabled={isSubmitting}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          Reject request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

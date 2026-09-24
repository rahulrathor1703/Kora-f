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
import { campaignDeleteRequestReasonSchema } from '@/lib/schemas/campaign-delete-request';

interface RequestCampaignDeleteDialogProps {
  open: boolean;
  campaignName: string;
  requesterName?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export default function RequestCampaignDeleteDialog({
  open,
  campaignName,
  requesterName,
  isSubmitting,
  onClose,
  onSubmit,
}: RequestCampaignDeleteDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setReason('');
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    const validation = campaignDeleteRequestReasonSchema.safeParse({ reason });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid reason');
      return;
    }

    setError(null);

    try {
      await onSubmit(validation.data.reason);
      setReason('');
      onClose();
    } catch {
      // Caller handles notification.
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Request campaign deletion</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          <Typography variant="body2" color="text.secondary">
            Submit a delete request for{' '}
            <strong>{campaignName || 'this campaign'}</strong>. An approver must
            review and approve before the campaign is removed.
          </Typography>
          {requesterName ? (
            <Typography variant="body2" color="text.secondary">
              Request will be raised by <strong>{requesterName}</strong>.
            </Typography>
          ) : null}
          <TextField
            label="Reason for deletion"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            multiline
            minRows={4}
            required
            fullWidth
            error={Boolean(error)}
            helperText={error ?? 'Minimum 10 characters'}
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
          color="error"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          Submit request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

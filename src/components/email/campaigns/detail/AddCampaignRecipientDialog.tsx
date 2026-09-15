'use client';

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { AddCampaignRecipientInput } from '@/lib/email/campaigns/recipient-types';

interface AddCampaignRecipientDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AddCampaignRecipientInput) => Promise<void>;
  isSubmitting: boolean;
}

const EMPTY_FORM: AddCampaignRecipientInput = {
  email: '',
  firstName: '',
  lastName: '',
  company: '',
};

export default function AddCampaignRecipientDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: AddCampaignRecipientDialogProps) {
  const [form, setForm] = useState<AddCampaignRecipientInput>(EMPTY_FORM);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = async () => {
    const email = form.email.trim();

    if (!email) {
      return;
    }

    try {
      await onSubmit({
        email,
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        company: form.company?.trim() || undefined,
      });

      setForm(EMPTY_FORM);
      onClose();
    } catch {
      // Keep the dialog open so the user can fix validation or retry.
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>Add person to campaign</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            This person is added only to this campaign and will start at step 1,
            even if other recipients are already on follow-ups.
          </Typography>
          <TextField
            autoFocus
            required
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="First name"
              value={form.firstName ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Last name"
              value={form.lastName ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
          <TextField
            label="Company"
            value={form.company ?? ''}
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          disabled={isSubmitting || !form.email.trim()}
          onClick={() => {
            void handleSubmit();
          }}
          className="rounded-xl"
        >
          Add person
        </Button>
      </DialogActions>
    </Dialog>
  );
}

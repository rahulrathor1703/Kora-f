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
import type {
  ContactListFieldSchema,
  CreateContactListMemberInput,
} from '@/lib/email/lists/detail-types';

export interface AddContactSubmitOptions {
  pushToCampaigns?: boolean;
}

interface AddContactDialogProps {
  open: boolean;
  fieldSchema: ContactListFieldSchema;
  isSubmitting: boolean;
  canPushToCampaigns?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (
    input: CreateContactListMemberInput,
    options?: AddContactSubmitOptions,
  ) => Promise<void>;
}

export default function AddContactDialog({
  open,
  fieldSchema,
  isSubmitting,
  canPushToCampaigns = false,
  error,
  onClose,
  onSubmit,
}: AddContactDialogProps) {
  const [email, setEmail] = useState('');
  const [standardValues, setStandardValues] = useState<Record<string, string>>(
    {},
  );
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  function resetForm() {
    setEmail('');
    setStandardValues({});
    setCustomValues({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function buildInput(): CreateContactListMemberInput {
    return {
      email: email.trim(),
      firstName: standardValues.firstName?.trim() || undefined,
      lastName: standardValues.lastName?.trim() || undefined,
      company: standardValues.company?.trim() || undefined,
      phone: standardValues.phone?.trim() || undefined,
      customFields: Object.fromEntries(
        Object.entries(customValues)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => value),
      ),
    };
  }

  async function handleSubmit(options?: AddContactSubmitOptions) {
    await onSubmit(buildInput(), options);
  }

  function renderField(key: string, label: string) {
    const isStandard = ['firstName', 'lastName', 'company', 'phone'].includes(
      key,
    );

    return (
      <TextField
        key={key}
        label={label}
        value={
          isStandard ? (standardValues[key] ?? '') : (customValues[key] ?? '')
        }
        onChange={(event) => {
          const value = event.target.value;
          if (isStandard) {
            setStandardValues((current) => ({ ...current, [key]: value }));
          } else {
            setCustomValues((current) => ({ ...current, [key]: value }));
          }
        }}
        fullWidth
      />
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add contact</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          <TextField
            label={fieldSchema.email.label}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
            autoFocus
          />
          {fieldSchema.fields.map((field) =>
            renderField(field.key, field.label),
          )}
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
        {canPushToCampaigns ? (
          <Button
            variant="outlined"
            onClick={() => void handleSubmit({ pushToCampaigns: true })}
            disabled={isSubmitting || !email.trim()}
            className="rounded-xl"
          >
            Add & push to campaigns
          </Button>
        ) : null}
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

'use client';

import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import MailboxFormFields from '@/components/email/mailboxes/MailboxFormFields';
import type { SenderMailbox, UpdateMailboxInput } from '@/lib/email/mailbox-types';
import {
  mailboxEditFormSchema,
  type MailboxFormValues,
} from '@/lib/schemas/mailbox';

interface EditMailboxDialogProps {
  mailbox: SenderMailbox | null;
  isSaving: boolean;
  onClose: () => void;
  onUpdate: (id: string, input: UpdateMailboxInput) => Promise<void>;
}

function toFormValues(mailbox: SenderMailbox): MailboxFormValues {
  return {
    provider: mailbox.provider,
    email: mailbox.email,
    displayName: mailbox.displayName,
    fromName: mailbox.fromName,
    dailySendLimit: String(mailbox.dailySendLimit),
    appPassword: '',
    smtpHost: mailbox.config.smtpHost ?? '',
    smtpPort: mailbox.config.smtpPort ? String(mailbox.config.smtpPort) : '587',
    smtpUser: mailbox.config.smtpUser ?? '',
    smtpPassword: '',
    smtpSecure: mailbox.config.smtpSecure ?? false,
  };
}

function toUpdateInput(values: MailboxFormValues): UpdateMailboxInput {
  const input: UpdateMailboxInput = {
    email: values.email.trim(),
    displayName: values.displayName.trim(),
    fromName: values.fromName.trim(),
    dailySendLimit: Number(values.dailySendLimit),
  };

  if (values.provider === 'smtp') {
    if (values.smtpHost?.trim()) {
      input.smtpHost = values.smtpHost.trim();
    }
    if (values.smtpPort?.trim()) {
      input.smtpPort = Number(values.smtpPort);
    }
    if (values.smtpUser?.trim()) {
      input.smtpUser = values.smtpUser.trim();
    }
    if (values.smtpPassword?.trim()) {
      input.smtpPassword = values.smtpPassword.trim();
    }
    if (values.smtpSecure !== undefined) {
      input.smtpSecure = values.smtpSecure;
    }
  }

  return input;
}

export default function EditMailboxDialog({
  mailbox,
  isSaving,
  onClose,
  onUpdate,
}: EditMailboxDialogProps) {
  const form = useForm<MailboxFormValues>({
    resolver: zodResolver(mailboxEditFormSchema),
    defaultValues: mailbox ? toFormValues(mailbox) : undefined,
  });

  useEffect(() => {
    if (mailbox) {
      form.reset(toFormValues(mailbox));
    }
  }, [mailbox, form]);

  function handleClose() {
    if (isSaving) {
      return;
    }

    onClose();
  }

  async function onSubmit(values: MailboxFormValues) {
    if (!mailbox) {
      return;
    }

    await onUpdate(mailbox.id, toUpdateInput(values));
    onClose();
  }

  return (
    <Dialog
      open={Boolean(mailbox)}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          className: 'rounded-[24px]',
        },
      }}
    >
      <DialogTitle className="font-bold">Edit mailbox</DialogTitle>
      <Divider />
      <DialogContent className="px-6 py-5">
        <FormProvider {...form}>
          <MailboxFormFields isSaving={isSaving} mode="edit" />
        </FormProvider>
      </DialogContent>
      <Divider />
      <DialogActions className="gap-2 px-6 py-4">
        <Button
          onClick={handleClose}
          disabled={isSaving}
          className="rounded-2xl px-4"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            isSaving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveOutlinedIcon />
            )
          }
          disabled={isSaving}
          onClick={() => void form.handleSubmit(onSubmit)()}
          className="rounded-2xl px-5"
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

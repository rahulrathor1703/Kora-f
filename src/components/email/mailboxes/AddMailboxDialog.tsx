'use client';

import AddIcon from '@mui/icons-material/Add';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import MailboxFormFields, {
  mailboxCreateFormDefaultValues,
} from '@/components/email/mailboxes/MailboxFormFields';
import type { CreateMailboxInput, OAuthPrefill } from '@/lib/email/mailbox-types';
import { normalizeAppPassword } from '@/lib/email/mailbox-password';
import {
  mailboxCreateFormSchema,
  type MailboxCreateFormValues,
} from '@/lib/schemas/mailbox';
import {
  deriveMailboxIdentityFromEmail,
} from '@/lib/email/mailbox-form-defaults';

interface AddMailboxDialogProps {
  open: boolean;
  isSaving: boolean;
  oauthPrefill?: OAuthPrefill | null;
  onClose: () => void;
  onCreate: (input: CreateMailboxInput) => Promise<void>;
}

function buildDefaultValues(oauthPrefill?: OAuthPrefill | null): MailboxCreateFormValues {
  if (!oauthPrefill) {
    return mailboxCreateFormDefaultValues;
  }

  return {
    ...mailboxCreateFormDefaultValues,
    provider: oauthPrefill.provider,
    email: oauthPrefill.email,
    oauthToken: oauthPrefill.oauthToken,
  };
}

function toCreateInput(values: MailboxCreateFormValues): CreateMailboxInput {
  const identity = deriveMailboxIdentityFromEmail(values.email);

  const input: CreateMailboxInput = {
    provider: values.provider,
    email: values.email.trim(),
    displayName: identity.displayName,
    fromName: identity.fromName,
    dailySendLimit: Number(values.dailySendLimit),
    warmupEnabled: false,
  };

  if (
    (values.provider === 'gmail' || values.provider === 'outlook') &&
    values.oauthToken?.trim()
  ) {
    input.oauthToken = values.oauthToken.trim();
  } else if (
    (values.provider === 'gmail' || values.provider === 'outlook') &&
    values.appPassword?.trim()
  ) {
    input.appPassword = normalizeAppPassword(values.appPassword);
  }

  if (values.provider === 'smtp') {
    input.smtpHost = values.smtpHost?.trim();
    input.smtpPort = Number(values.smtpPort);
    input.smtpUser = values.smtpUser?.trim();
    input.smtpPassword = values.smtpPassword?.trim();
    input.smtpSecure = Boolean(values.smtpSecure);
  }

  return input;
}

export default function AddMailboxDialog({
  open,
  isSaving,
  oauthPrefill,
  onClose,
  onCreate,
}: AddMailboxDialogProps) {
  const form = useForm<MailboxCreateFormValues>({
    resolver: zodResolver(mailboxCreateFormSchema),
    defaultValues: buildDefaultValues(oauthPrefill),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(oauthPrefill));
    }
  }, [open, oauthPrefill, form]);

  function handleClose() {
    if (isSaving) {
      return;
    }

    form.reset(mailboxCreateFormDefaultValues);
    onClose();
  }

  async function onSubmit(values: MailboxCreateFormValues) {
    await onCreate(toCreateInput(values));
    form.reset(mailboxCreateFormDefaultValues);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="add-mailbox-title"
      slots={{ transition: Fade }}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(6px)' },
        },
        paper: {
          className: 'rounded-[24px]',
          sx: {
            transform: open ? 'scale(1)' : 'scale(0.98)',
            transition: 'transform 0.2s ease',
          },
        },
      }}
    >
      <DialogTitle id="add-mailbox-title" className="pb-2 pt-6">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white">
            <MailOutlineOutlinedIcon fontSize="small" />
          </Box>
          <Stack spacing={0.5} className="min-w-0 pt-0.5">
            <Typography variant="h6" component="span" className="font-bold">
              Add mailbox
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent className="px-6 py-5">
        <FormProvider {...form}>
          <MailboxFormFields isSaving={isSaving} mode="create" />
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
              <AddIcon />
            )
          }
          disabled={isSaving}
          onClick={() => void form.handleSubmit(onSubmit)()}
          className="rounded-2xl px-5 shadow-primary-soft"
        >
          Add mailbox
        </Button>
      </DialogActions>
    </Dialog>
  );
}

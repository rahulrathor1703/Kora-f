'use client';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import AddMailboxDialog from '@/components/email/mailboxes/AddMailboxDialog';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useMailboxCampaignLocks } from '@/hooks/useMailboxCampaignLocks';
import { useMailboxes } from '@/hooks/useMailboxes';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api/client';
import { getDefaultMailboxSendQuota } from '@/lib/email/campaigns/mailbox-capacity';
import type {
  CreateMailboxInput,
  MailboxProvider,
  SenderMailbox,
} from '@/lib/email/mailbox-types';
import { getMailboxErrorMessage } from '@/lib/email/mailbox-error-messages';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

const providerLabels: Record<MailboxProvider, string> = {
  gmail: 'Gmail',
  outlook: 'Outlook',
  smtp: 'SMTP',
};

interface ExpandableMailboxCardProps {
  mailbox: SenderMailbox;
  selected: boolean;
  locked?: boolean;
  fieldIndex: number | null;
  onToggle: () => void;
}

function ExpandableMailboxCard({
  mailbox,
  selected,
  locked,
  fieldIndex,
  onToggle,
}: ExpandableMailboxCardProps) {
  const { control } = useFormContext<CampaignWizardFormValues>();
  const providerLabel = providerLabels[mailbox.provider];
  const dailyLimitLabel = `${mailbox.dailySendLimit.toLocaleString()}/day limit`;

  return (
    <Box
      className={`rounded-2xl border border-surface-border bg-surface outline-none transition-colors focus-within:ring-2 focus-within:ring-primary/40 ${
        locked
          ? 'bg-surface-muted/40 opacity-75'
          : !selected
            ? 'hover:border-primary/25 hover:bg-primary/5'
            : ''
      }`}
    >
      <Box
        role="checkbox"
        aria-checked={selected}
        aria-expanded={selected}
        aria-disabled={locked ?? false}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        className="flex cursor-pointer items-start p-4"
      >
        <Stack spacing={0.5} className="min-w-0 flex-1">
          <Stack
            direction="row"
            sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
            spacing={2}
          >
            <Typography variant="subtitle2" className="truncate font-bold">
              {mailbox.displayName}
            </Typography>
            {selected ? (
              <Typography
                variant="caption"
                color="text.secondary"
                className="shrink-0"
              >
                {dailyLimitLabel}
              </Typography>
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary" className="truncate">
            {mailbox.email}
          </Typography>
          {!selected ? (
            <Typography variant="caption" color="text.secondary" className="pt-1">
              {providerLabel} · {mailbox.dailySendLimit}/day
              {locked ? ' · In use' : ''}
            </Typography>
          ) : null}
        </Stack>

        {selected ? (
          <CheckCircleIcon
            className="ml-3 shrink-0 text-primary"
            sx={{ fontSize: 20 }}
            aria-hidden
          />
        ) : (
          <RadioButtonUncheckedIcon
            className="ml-3 shrink-0 text-secondary/40"
            sx={{ fontSize: 20 }}
            aria-hidden
          />
        )}
      </Box>

      <Collapse in={selected && fieldIndex !== null} unmountOnExit>
        {fieldIndex !== null ? (
          <Box
            className="border-t border-surface-border px-4 pb-4 pt-3"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Stack spacing={2.5}>
              <Box>
                <WizardFieldLabel
                  required
                  htmlFor={`mailboxSenders.${fieldIndex}.senderName`}
                >
                  Sender name
                </WizardFieldLabel>
                <Controller
                  name={`mailboxSenders.${fieldIndex}.senderName`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      id={`mailboxSenders.${fieldIndex}.senderName`}
                      fullWidth
                      autoComplete="off"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      className="rounded-xl"
                    />
                  )}
                />
              </Box>

              <Box>
                <WizardFieldLabel
                  htmlFor={`mailboxSenders.${fieldIndex}.signature`}
                >
                  Signature
                </WizardFieldLabel>
                <Controller
                  name={`mailboxSenders.${fieldIndex}.signature`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      id={`mailboxSenders.${fieldIndex}.signature`}
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder={'Best regards,\nYour Name\nCompany'}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      className="rounded-xl"
                    />
                  )}
                />
              </Box>
            </Stack>
          </Box>
        ) : null}
      </Collapse>
    </Box>
  );
}

function getMailboxSendersErrorMessage(
  error: { message?: string; root?: { message?: string } } | undefined,
): string | undefined {
  if (!error) {
    return undefined;
  }

  if (typeof error.message === 'string') {
    return error.message;
  }

  if (typeof error.root?.message === 'string') {
    return error.root.message;
  }

  return undefined;
}

export default function MailboxMultiPicker() {
  const { control, watch } = useFormContext<CampaignWizardFormValues>();
  const { errors } = useFormState({
    control,
    name: 'mailboxSenders',
  });
  const campaignId = watch('campaignId');
  const dailyBatchSize = watch('dailyBatchSize');
  const toOrgPath = useOrgPath();
  const canCreateMailbox = useHasPermission('mailboxes:create');
  const { notifyError, notifySuccess } = useNotify();
  const { getLockReason, isMailboxLocked } = useMailboxCampaignLocks(campaignId);
  const { mailboxes, isLoading, isSaving, error, createMailbox } = useMailboxes();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mailboxSenders',
  });
  const [addOpen, setAddOpen] = useState(false);

  const activeMailboxes = mailboxes.filter((mailbox) => mailbox.status === 'active');
  const fieldIndexByMailboxId = useMemo(
    () => new Map(fields.map((field, index) => [field.mailboxId, index])),
    [fields],
  );
  const selectedMailboxIds = new Set(fields.map((field) => field.mailboxId));
  const mailboxSendersErrorMessage = getMailboxSendersErrorMessage(
    errors.mailboxSenders,
  );

  function selectMailbox(mailbox: SenderMailbox) {
    if (selectedMailboxIds.has(mailbox.id)) {
      return;
    }

    const lockReason = getLockReason(mailbox.id, mailbox.email);
    if (lockReason) {
      notifyError(lockReason);
      return;
    }

    append({
      mailboxId: mailbox.id,
      senderName: mailbox.fromName,
      senderEmail: mailbox.email,
      signature: '',
      dailySendQuota: getDefaultMailboxSendQuota(
        dailyBatchSize,
        mailbox.dailySendLimit,
      ),
    });
  }

  function toggleMailbox(mailbox: SenderMailbox) {
    const existingIndex = fields.findIndex(
      (field) => field.mailboxId === mailbox.id,
    );

    if (existingIndex >= 0) {
      remove(existingIndex);
      return;
    }

    selectMailbox(mailbox);
  }

  async function handleCreate(input: CreateMailboxInput) {
    try {
      const created = await createMailbox(input);
      selectMailbox(created);
      notifySuccess('Mailbox added and selected.');
    } catch (err) {
      notifyError(
        getMailboxErrorMessage(
          getApiErrorMessage(err, 'Failed to create mailbox'),
          'Failed to create mailbox',
        ),
      );
      throw err;
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="subtitle1" className="font-bold">
            Sender
          </Typography>
          <WizardFieldLabel required>Select mailbox</WizardFieldLabel>
        </Box>

        {canCreateMailbox ? (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            className="w-fit rounded-xl normal-case self-start sm:self-auto"
          >
            Add mailbox
          </Button>
        ) : null}
      </Stack>

      {error ? (
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
      ) : null}

      {isLoading ? (
        <Grid container spacing={2}>
          {[0, 1].map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={140} className="rounded-2xl" />
            </Grid>
          ))}
        </Grid>
      ) : activeMailboxes.length === 0 ? (
        <Alert
          severity="warning"
          className="rounded-2xl"
          action={
            canCreateMailbox ? (
              <Button
                size="small"
                onClick={() => setAddOpen(true)}
                className="rounded-xl"
              >
                Add mailbox
              </Button>
            ) : (
              <Button
                component={Link}
                href={toOrgPath('/email/mailboxes')}
                size="small"
                className="rounded-xl"
              >
                Manage mailboxes
              </Button>
            )
          }
        >
          No active mailboxes found. Connect a mailbox before creating a campaign.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          <Grid container spacing={2}>
            {activeMailboxes.map((mailbox) => {
              const selected = selectedMailboxIds.has(mailbox.id);
              const fieldIndex = fieldIndexByMailboxId.get(mailbox.id) ?? null;

              return (
                <Grid key={mailbox.id} size={{ xs: 12, sm: 6 }}>
                  <ExpandableMailboxCard
                    mailbox={mailbox}
                    selected={selected}
                    fieldIndex={fieldIndex}
                    locked={!selected && isMailboxLocked(mailbox.id)}
                    onToggle={() => toggleMailbox(mailbox)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      )}

      {mailboxSendersErrorMessage ? (
        <Typography variant="caption" color="error" role="alert">
          {mailboxSendersErrorMessage}
        </Typography>
      ) : null}

      {canCreateMailbox ? (
        <AddMailboxDialog
          open={addOpen}
          isSaving={isSaving}
          onClose={() => setAddOpen(false)}
          onCreate={handleCreate}
        />
      ) : null}
    </Stack>
  );
}

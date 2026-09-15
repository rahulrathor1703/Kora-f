'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useMailboxCampaignLocks } from '@/hooks/useMailboxCampaignLocks';
import { useMailboxes } from '@/hooks/useMailboxes';
import {
  buildTotalQuotaBatchError,
  getDefaultMailboxSendQuota,
} from '@/lib/email/campaigns/mailbox-capacity';
import type {
  EmailCampaignMailboxSender,
  UpdateCampaignMailboxSenderInput,
} from '@/lib/email/campaigns/types';

interface EditCampaignMailboxSenderDialogProps {
  open: boolean;
  campaignId: string;
  sender: EmailCampaignMailboxSender | null;
  dailyBatchSize: number;
  assignedMailboxIds: string[];
  activeQuotaTotal: number;
  onClose: () => void;
  onSubmit: (input: UpdateCampaignMailboxSenderInput) => Promise<void>;
  isSubmitting: boolean;
}

export default function EditCampaignMailboxSenderDialog({
  open,
  campaignId,
  sender,
  dailyBatchSize,
  assignedMailboxIds,
  activeQuotaTotal,
  onClose,
  onSubmit,
  isSubmitting,
}: EditCampaignMailboxSenderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {open && sender ? (
        <EditCampaignMailboxSenderDialogForm
          key={sender.id}
          campaignId={campaignId}
          sender={sender}
          dailyBatchSize={dailyBatchSize}
          assignedMailboxIds={assignedMailboxIds}
          activeQuotaTotal={activeQuotaTotal}
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </Dialog>
  );
}

function EditCampaignMailboxSenderDialogForm({
  campaignId,
  sender,
  dailyBatchSize,
  assignedMailboxIds,
  activeQuotaTotal,
  onClose,
  onSubmit,
  isSubmitting,
}: Omit<EditCampaignMailboxSenderDialogProps, 'open'> & {
  sender: EmailCampaignMailboxSender;
}) {
  const { mailboxes } = useMailboxes();
  const { getLockReason } = useMailboxCampaignLocks(campaignId);
  const [selectedMailboxId, setSelectedMailboxId] = useState(sender.mailboxId);
  const [senderName, setSenderName] = useState(sender.senderName);
  const [senderEmail, setSenderEmail] = useState(sender.senderEmail);
  const [signature, setSignature] = useState(sender.signature ?? '');
  const [dailySendQuota, setDailySendQuota] = useState(
    sender.dailySendQuota ?? 1,
  );
  const [error, setError] = useState<string | null>(null);

  const selectableMailboxes = useMemo(() => {
    const currentMailboxId = sender.mailboxId;

    return mailboxes.filter((mailbox) => {
      if (mailbox.status !== 'active') {
        return false;
      }

      if (mailbox.id === currentMailboxId) {
        return true;
      }

      if (assignedMailboxIds.includes(mailbox.id)) {
        return false;
      }

      return !getLockReason(mailbox.id, mailbox.email);
    });
  }, [assignedMailboxIds, getLockReason, mailboxes, sender.mailboxId]);

  const selectedMailbox = selectableMailboxes.find(
    (mailbox) => mailbox.id === selectedMailboxId,
  );

  const adjustedQuotaTotal =
    activeQuotaTotal -
    (sender.status === 'active' ? (sender.dailySendQuota ?? 0) : 0) +
    dailySendQuota;

  const quotaError = buildTotalQuotaBatchError(
    adjustedQuotaTotal,
    dailyBatchSize,
  );

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSelectMailbox = (mailboxId: string) => {
    const mailbox = selectableMailboxes.find((item) => item.id === mailboxId);

    if (!mailbox) {
      return;
    }

    setSelectedMailboxId(mailbox.id);

    if (mailbox.id !== sender.mailboxId) {
      setDailySendQuota(
        getDefaultMailboxSendQuota(dailyBatchSize, mailbox.dailySendLimit),
      );
    }

    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedMailbox) {
      setError('Select a mailbox.');
      return;
    }

    if (!senderName.trim() || !senderEmail.trim()) {
      setError('Sender name and email are required.');
      return;
    }

    if (quotaError) {
      setError(quotaError);
      return;
    }

    if (dailySendQuota > selectedMailbox.dailySendLimit) {
      setError(
        `Daily quota cannot exceed mailbox limit of ${selectedMailbox.dailySendLimit}.`,
      );
      return;
    }

    setError(null);

    const payload: UpdateCampaignMailboxSenderInput = {
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      signature: signature.trim() || undefined,
      dailySendQuota,
    };

    if (selectedMailboxId !== sender.mailboxId) {
      payload.mailboxId = selectedMailboxId;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch {
      // Keep dialog open for retry.
    }
  };

  return (
    <>
      <DialogTitle sx={{ pr: 6 }}>Edit campaign mailbox</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Update sender settings or swap to a different mailbox. Swapping resets
            today&apos;s send count for this sender only.
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Grid container spacing={1.5}>
            {selectableMailboxes.map((mailbox) => {
              const selected = mailbox.id === selectedMailboxId;

              return (
                <Grid key={mailbox.id} size={{ xs: 12, sm: 6 }}>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectMailbox(mailbox.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelectMailbox(mailbox.id);
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                      selected
                        ? 'border-primary/40 bg-primary-soft'
                        : 'border-surface-border hover:border-primary/25 hover:bg-primary/5'
                    }`}
                  >
                    <Typography variant="subtitle2" className="font-bold">
                      {mailbox.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mailbox.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mailbox.dailySendLimit}/day
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Stack spacing={2}>
            <TextField
              label="Sender name"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Sender email"
              value={senderEmail}
              onChange={(event) => setSenderEmail(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Daily send quota"
              type="number"
              value={dailySendQuota}
              onChange={(event) =>
                setDailySendQuota(Number(event.target.value) || 0)
              }
              required
              fullWidth
              helperText={
                quotaError ??
                (selectedMailbox
                  ? `Mailbox limit: ${selectedMailbox.dailySendLimit}/day`
                  : undefined)
              }
              error={Boolean(quotaError)}
            />
            <TextField
              label="Signature"
              value={signature}
              onChange={(event) => setSignature(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          Save changes
        </Button>
      </DialogActions>
    </>
  );
}

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
import type { CreateEmailCampaignMailboxSenderInput } from '@/lib/email/campaigns/types';

interface AddCampaignMailboxSenderDialogProps {
  open: boolean;
  campaignId: string;
  dailyBatchSize: number;
  assignedMailboxIds: string[];
  activeQuotaTotal: number;
  onClose: () => void;
  onSubmit: (input: CreateEmailCampaignMailboxSenderInput) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddCampaignMailboxSenderDialog({
  open,
  campaignId,
  dailyBatchSize,
  assignedMailboxIds,
  activeQuotaTotal,
  onClose,
  onSubmit,
  isSubmitting,
}: AddCampaignMailboxSenderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {open ? (
        <AddCampaignMailboxSenderDialogForm
          campaignId={campaignId}
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

function AddCampaignMailboxSenderDialogForm({
  campaignId,
  dailyBatchSize,
  assignedMailboxIds,
  activeQuotaTotal,
  onClose,
  onSubmit,
  isSubmitting,
}: Omit<AddCampaignMailboxSenderDialogProps, 'open'>) {
  const { mailboxes, isLoading } = useMailboxes();
  const { getLockReason } = useMailboxCampaignLocks(campaignId);
  const [selectedMailboxId, setSelectedMailboxId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [signature, setSignature] = useState('');
  const [dailySendQuota, setDailySendQuota] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const availableMailboxes = useMemo(
    () =>
      mailboxes.filter(
        (mailbox) =>
          mailbox.status === 'active' &&
          !assignedMailboxIds.includes(mailbox.id) &&
          !getLockReason(mailbox.id, mailbox.email),
      ),
    [assignedMailboxIds, getLockReason, mailboxes],
  );

  const selectedMailbox = availableMailboxes.find(
    (mailbox) => mailbox.id === selectedMailboxId,
  );

  const quotaError = buildTotalQuotaBatchError(
    activeQuotaTotal + dailySendQuota,
    dailyBatchSize,
  );

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSelectMailbox = (mailboxId: string) => {
    const mailbox = availableMailboxes.find((item) => item.id === mailboxId);

    if (!mailbox) {
      return;
    }

    setSelectedMailboxId(mailbox.id);
    setSenderName(mailbox.fromName || mailbox.displayName);
    setSenderEmail(mailbox.email);
    setDailySendQuota(
      getDefaultMailboxSendQuota(dailyBatchSize, mailbox.dailySendLimit),
    );
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedMailbox) {
      setError('Select a mailbox to add.');
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

    try {
      await onSubmit({
        mailboxId: selectedMailbox.id,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        signature: signature.trim() || undefined,
        dailySendQuota,
      });
      onClose();
    } catch {
      // Keep dialog open for retry.
    }
  };

  return (
    <>
      <DialogTitle sx={{ pr: 6 }}>Add mailbox to campaign</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            The new mailbox joins the send rotation immediately. Campaign
            recipients continue from their current step.
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading mailboxes...
            </Typography>
          ) : availableMailboxes.length === 0 ? (
            <Alert severity="info">
              No available active mailboxes. Add a mailbox in Settings or release
              one from another campaign first.
            </Alert>
          ) : (
            <Grid container spacing={1.5}>
              {availableMailboxes.map((mailbox) => {
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
          )}

          {selectedMailbox ? (
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
                  `Mailbox limit: ${selectedMailbox.dailySendLimit}/day`
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
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !selectedMailbox}
        >
          Add mailbox
        </Button>
      </DialogActions>
    </>
  );
}

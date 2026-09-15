'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { EmailCampaignReplyCategory } from '@/lib/email/campaigns/reply-category-utils';
import { REPLY_CATEGORY_OPTIONS } from '@/lib/email/campaigns/reply-category-utils';
import type { InboxReply } from '@/lib/email/inbox/inbox-types';

export interface MarkInboxReplyDoneInput {
  replyCategory: EmailCampaignReplyCategory;
  reason: string;
}

interface MarkInboxReplyDoneDialogProps {
  reply: InboxReply | null;
  open: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: MarkInboxReplyDoneInput) => Promise<void>;
}

export default function MarkInboxReplyDoneDialog({
  reply,
  open,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: MarkInboxReplyDoneDialogProps) {
  const [replyCategory, setReplyCategory] = useState<
    EmailCampaignReplyCategory | null
  >(reply?.replyCategory ?? null);
  const [reason, setReason] = useState('');

  if (!reply) {
    return null;
  }

  const displayName = reply.recipientName ?? reply.recipientEmail;
  const trimmedReason = reason.trim();
  const canSubmit = replyCategory !== null && !isSubmitting;

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mark reply as done</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Select a category for the reply from{' '}
            <Box component="span" className="font-medium text-text-primary">
              {displayName}
            </Box>
            . You can add an optional note before marking it as done.
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2" className="font-medium text-foreground">
              Category
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {REPLY_CATEGORY_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  color={replyCategory === option.value ? 'primary' : 'default'}
                  variant={replyCategory === option.value ? 'filled' : 'outlined'}
                  onClick={() => setReplyCategory(option.value)}
                  disabled={isSubmitting}
                  className="rounded-lg"
                />
              ))}
            </Stack>
          </Stack>

          <TextField
            label="Note (optional)"
            placeholder="e.g. Scheduled a call, forwarded to sales..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            multiline
            minRows={3}
            disabled={isSubmitting}
            fullWidth
          />

          {error ? (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting} className="rounded-xl">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={() => {
            if (!replyCategory) {
              return;
            }

            void onSubmit({
              replyCategory,
              reason: trimmedReason,
            });
          }}
          className="rounded-xl"
        >
          {isSubmitting ? 'Saving…' : 'Mark as done'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

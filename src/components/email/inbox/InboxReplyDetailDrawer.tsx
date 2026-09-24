'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  formatReplyCategoryLabel,
  getReplyCategoryChipColor,
} from '@/lib/email/campaigns/reply-category-utils';
import { formatTrackingTimestamp } from '@/lib/email/campaigns/recipient-status-utils';
import type { InboxReply } from '@/lib/email/inbox/inbox-types';
import { isInboxReplyDone } from '@/lib/email/inbox/inbox-reply-utils';

interface InboxReplyDetailDrawerProps {
  reply: InboxReply | null;
  open: boolean;
  onClose: () => void;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
        {label}
      </Typography>
      <Typography variant="body2" className="font-medium">
        {value}
      </Typography>
    </Stack>
  );
}

export default function InboxReplyDetailDrawer({
  reply,
  open,
  onClose,
}: InboxReplyDetailDrawerProps) {
  const toOrgPath = useOrgPath();

  if (!reply) {
    return null;
  }

  const displayName = reply.recipientName ?? reply.recipientEmail;
  const isDone = isInboxReplyDone(reply);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className="flex h-full w-full max-w-md flex-col">
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h6" className="font-bold">
            Reply details
          </Typography>
          <IconButton aria-label="Close reply details" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={3} className="flex-1 overflow-y-auto px-3 py-4">
          <Stack spacing={0.5}>
            <Typography variant="h6" className="font-bold">
              {displayName}
            </Typography>
            {reply.recipientName ? (
              <Typography variant="body2" color="text.secondary">
                {reply.recipientEmail}
              </Typography>
            ) : null}
          </Stack>

          <DetailField label="Campaign" value={reply.campaignName} />
          <DetailField label="Subject" value={reply.replySubject ?? '—'} />
          <DetailField
            label="Replied"
            value={formatTrackingTimestamp(reply.repliedAt)}
          />
          <DetailField
            label="Sequence step"
            value={`Step ${reply.currentStepOrder}`}
          />
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
              Category
            </Typography>
            {reply.replyCategory ? (
              <Chip
                label={formatReplyCategoryLabel(reply.replyCategory)}
                color={getReplyCategoryChipColor(reply.replyCategory)}
                size="small"
                className="w-fit rounded-lg"
              />
            ) : (
              <Typography variant="body2" className="font-medium">
                Uncategorized
              </Typography>
            )}
          </Stack>

          {isDone ? (
            <>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
                  Status
                </Typography>
                <Chip
                  icon={<CheckCircleOutlinedIcon />}
                  label="Marked as done"
                  color="success"
                  size="small"
                  className="w-fit rounded-lg"
                />
              </Stack>
              <DetailField
                label="Done reason"
                value={reply.replyDoneReason?.trim() || '—'}
              />
              <DetailField
                label="Marked done"
                value={formatTrackingTimestamp(reply.replyReadAt)}
              />
            </>
          ) : null}
        </Stack>

        <Box className="border-t border-surface-border px-3 py-4">
          <Button
            component={Link}
            href={toOrgPath(`/email/campaigns/${reply.campaignId}`)}
            variant="contained"
            endIcon={<OpenInNewOutlinedIcon />}
            className="w-full rounded-xl"
            onClick={onClose}
          >
            View in campaign
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

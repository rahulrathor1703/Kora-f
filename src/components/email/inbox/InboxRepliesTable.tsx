'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import InboxReplyDoneIndicator from '@/components/email/inbox/InboxReplyDoneIndicator';
import MarkInboxReplyDoneDialog, {
  type MarkInboxReplyDoneInput,
} from '@/components/email/inbox/MarkInboxReplyDoneDialog';
import { useMarkInboxReplyDone } from '@/hooks/useMarkInboxReplyDone';
import type { InboxReply } from '@/lib/email/inbox/inbox-types';
import { isInboxReplyDone } from '@/lib/email/inbox/inbox-reply-utils';
import {
  formatReplyCategoryLabel,
  getReplyCategoryChipColor,
} from '@/lib/email/campaigns/reply-category-utils';
import { formatTrackingTimestamp } from '@/lib/email/campaigns/recipient-status-utils';

interface InboxReplyRow extends Record<string, unknown> {
  id: string;
  from: string;
  fromEmail: string;
  campaignName: string;
  replySubject: string | null;
  repliedAt: string | null;
  replyCategory: string | null;
  actions: string;
  reply: InboxReply;
}

interface InboxRepliesTableProps {
  replies: InboxReply[];
  isLoading: boolean;
  hideCampaignColumn?: boolean;
  onRowClick: (reply: InboxReply) => void;
}

function toRow(reply: InboxReply): InboxReplyRow {
  return {
    id: reply.recipientId,
    from: reply.recipientName ?? reply.recipientEmail,
    fromEmail: reply.recipientEmail,
    campaignName: reply.campaignName,
    replySubject: reply.replySubject,
    repliedAt: reply.repliedAt,
    replyCategory: reply.replyCategory,
    actions: reply.recipientId,
    reply,
  };
}

export default function InboxRepliesTable({
  replies,
  isLoading,
  hideCampaignColumn = false,
  onRowClick,
}: InboxRepliesTableProps) {
  const rows = replies.map(toRow);
  const [replyToMarkDone, setReplyToMarkDone] = useState<InboxReply | null>(null);
  const {
    markReplyDone,
    isMarkingDone,
    error: markDoneError,
    reset: resetMarkDoneError,
  } = useMarkInboxReplyDone();

  const handleOpenMarkDone = useCallback((reply: InboxReply) => {
    resetMarkDoneError();
    setReplyToMarkDone(reply);
  }, [resetMarkDoneError]);

  const handleCloseMarkDone = useCallback(() => {
    if (isMarkingDone) {
      return;
    }

    setReplyToMarkDone(null);
    resetMarkDoneError();
  }, [isMarkingDone, resetMarkDoneError]);

  const handleSubmitMarkDone = useCallback(
    async (input: MarkInboxReplyDoneInput) => {
      if (!replyToMarkDone) {
        return;
      }

      await markReplyDone({
        recipientId: replyToMarkDone.recipientId,
        replyCategory: input.replyCategory,
        reason: input.reason || undefined,
      });
      setReplyToMarkDone(null);
      resetMarkDoneError();
    },
    [markReplyDone, replyToMarkDone, resetMarkDoneError],
  );

  return (
    <>
    <DataTable<InboxReplyRow>
      tableId={
        hideCampaignColumn ? 'email-inbox-replies-campaign' : 'email-inbox-replies'
      }
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      includeFields={[
        'from',
        ...(hideCampaignColumn ? [] : (['campaignName'] as const)),
        'replySubject',
        'repliedAt',
        'replyCategory',
        'actions',
      ]}
      excludeFields={[
        'id',
        'reply',
        'fromEmail',
        ...(hideCampaignColumn ? (['campaignName'] as const) : []),
      ]}
      columnOverrides={{
        from: {
          label: 'From',
          render: (row) => (
            <Stack spacing={0.25}>
              <Typography variant="body2" className="font-medium">
                {row.from}
              </Typography>
              {row.from !== row.fromEmail ? (
                <Typography variant="caption" color="text.secondary">
                  {row.fromEmail}
                </Typography>
              ) : null}
            </Stack>
          ),
        },
        campaignName: { label: 'Campaign' },
        replySubject: {
          label: 'Subject',
          render: (row) => row.replySubject ?? '—',
        },
        repliedAt: {
          label: 'Replied',
          render: (row) => formatTrackingTimestamp(row.repliedAt),
        },
        replyCategory: {
          label: 'Category',
          render: (row) =>
            row.replyCategory ? (
              <Chip
                label={formatReplyCategoryLabel(row.replyCategory)}
                color={getReplyCategoryChipColor(row.replyCategory)}
                size="small"
                className="rounded-lg"
              />
            ) : (
              'Uncategorized'
            ),
        },
        actions: {
          label: '',
          align: 'right',
          searchable: false,
          render: (row) => (
            <Box onClick={(event) => event.stopPropagation()}>
              {isInboxReplyDone(row.reply) ? (
                <InboxReplyDoneIndicator reply={row.reply} />
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  disabled={
                    isMarkingDone && replyToMarkDone?.recipientId === row.id
                  }
                  onClick={() => handleOpenMarkDone(row.reply)}
                  className="rounded-xl whitespace-nowrap"
                >
                  Mark as done
                </Button>
              )}
            </Box>
          ),
        },
      }}
      emptyMessage="No replies yet. Replies from campaign recipients will appear here once detected."
      noResultsMessage="No replies match your search or filters."
      enableSearch={false}
      enablePagination={false}
      persistPreferences={false}
      onRowClick={(row) => onRowClick(row.reply)}
    />

    <MarkInboxReplyDoneDialog
      key={replyToMarkDone?.recipientId ?? 'closed'}
      reply={replyToMarkDone}
      open={Boolean(replyToMarkDone)}
      isSubmitting={isMarkingDone}
      error={markDoneError}
      onClose={handleCloseMarkDone}
      onSubmit={handleSubmitMarkDone}
    />
    </>
  );
}

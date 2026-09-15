'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  formatReplyCategoryLabel,
  getReplyCategoryChipColor,
} from '@/lib/email/campaigns/reply-category-utils';
import { formatTrackingTimestamp } from '@/lib/email/campaigns/recipient-status-utils';
import type { InboxReply } from '@/lib/email/inbox/inbox-types';
import { isInboxReplyDone } from '@/lib/email/inbox/inbox-reply-utils';

interface InboxReplyDoneIndicatorProps {
  reply: InboxReply;
}

export default function InboxReplyDoneIndicator({
  reply,
}: InboxReplyDoneIndicatorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!isInboxReplyDone(reply)) {
    return null;
  }

  const reason = reply.replyDoneReason?.trim();
  const markedAtLabel = formatTrackingTimestamp(reply.replyReadAt);

  return (
    <>
      <Tooltip
        title="Marked as done. Click to view details."
        placement="left"
        arrow
      >
        <IconButton
          aria-label="Reply marked as done"
          size="small"
          color="success"
          onClick={(event) => {
            event.stopPropagation();
            setAnchorEl(event.currentTarget);
          }}
        >
          <CheckCircleOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClick={(event) => event.stopPropagation()}
      >
        <Box className="max-w-xs p-4">
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" className="font-bold">
              Marked as done
            </Typography>
            {reply.replyCategory ? (
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
                  Category
                </Typography>
                <Box>
                  <Chip
                    label={formatReplyCategoryLabel(reply.replyCategory)}
                    color={getReplyCategoryChipColor(reply.replyCategory)}
                    size="small"
                    className="rounded-lg"
                  />
                </Box>
              </Stack>
            ) : null}
            {reason ? (
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
                  Note
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {reason}
                </Typography>
              </Stack>
            ) : null}
            {markedAtLabel ? (
              <Typography variant="caption" color="text.secondary">
                {markedAtLabel}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

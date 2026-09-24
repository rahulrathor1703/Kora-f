'use client';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type { DeliverabilityItem } from '@/lib/email/mailbox-deliverability-config';

interface MailboxDeliverabilityBadgeProps {
  item: DeliverabilityItem;
  enabled: boolean;
  /** When true, hides the label below the badge (table cells use column headers). */
  compact?: boolean;
}

export default function MailboxDeliverabilityBadge({
  item,
  enabled,
  compact = false,
}: MailboxDeliverabilityBadgeProps) {
  const statusLabel = enabled ? 'passing' : 'failing';

  return (
    <Box
      className={
        compact
          ? 'mailbox-deliverability-tile mailbox-deliverability-tile-compact'
          : 'mailbox-deliverability-tile'
      }
    >
      <Tooltip
        title={`${item.fullName} — ${statusLabel}`}
        placement="top"
        arrow
      >
        <Box
          aria-label={`${item.label} ${statusLabel}`}
          className={`mailbox-deliverability-status mailbox-deliverability-status-readonly ${compact ? 'mailbox-deliverability-status-compact' : ''} ${enabled ? 'mailbox-deliverability-status-pass' : 'mailbox-deliverability-status-fail'}`}
        >
          <span aria-hidden="true">{enabled ? '✓' : '×'}</span>
        </Box>
      </Tooltip>

      {!compact ? (
        <Tooltip title={item.fullName} placement="top" arrow>
          <span className="mailbox-deliverability-label">{item.label}</span>
        </Tooltip>
      ) : null}
    </Box>
  );
}

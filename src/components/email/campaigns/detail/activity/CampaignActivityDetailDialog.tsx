'use client';

import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import UnsubscribeOutlinedIcon from '@mui/icons-material/UnsubscribeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import { useMemo } from 'react';
import {
  useCampaignRecipient,
  useCampaignRecipientEvents,
} from '@/hooks/useEmailCampaigns';
import {
  CAMPAIGN_EVENT_TYPE_LABELS,
  type CampaignEvent,
  type EmailCampaignEventType,
} from '@/lib/email/campaigns/event-types';
import {
  formatCampaignEventSubtext,
  formatCampaignEventTimestamp,
} from '@/lib/email/campaigns/event-utils';
import type { CampaignRecipientMessage } from '@/lib/email/campaigns/recipient-types';
import {
  CAMPAIGN_RECIPIENT_STATUS_COLORS,
  CAMPAIGN_RECIPIENT_STATUS_LABELS,
  formatTrackingTimestamp,
} from '@/lib/email/campaigns/recipient-status-utils';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface CampaignActivityDetailDialogProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignStatus: EmailCampaignStatus;
  selectedEvent: CampaignEvent | null;
}

const EVENT_ICON_CONFIG: Record<
  EmailCampaignEventType,
  { Icon: SvgIconComponent; palette: 'info' | 'warning' | 'primary' | 'error' | 'success' | 'secondary' }
> = {
  sent: { Icon: SendOutlinedIcon, palette: 'info' },
  open: { Icon: VisibilityOutlinedIcon, palette: 'warning' },
  click: { Icon: MouseOutlinedIcon, palette: 'primary' },
  bounce: { Icon: ErrorOutlineOutlinedIcon, palette: 'error' },
  send_failed: { Icon: MailOutlineOutlinedIcon, palette: 'error' },
  reply: { Icon: ReplyOutlinedIcon, palette: 'success' },
  unsubscribe: { Icon: UnsubscribeOutlinedIcon, palette: 'secondary' },
};

function formatStepLine(message: CampaignRecipientMessage): string {
  const parts: string[] = [];

  if (message.deliveryStatus === 'sent' && message.sentAt) {
    parts.push(`Sent ${formatTrackingTimestamp(message.sentAt)}`);
  } else if (message.deliveryStatus !== 'sent') {
    parts.push(message.deliveryStatus);
  }

  if (message.openedAt) {
    parts.push(`Opened ${formatTrackingTimestamp(message.openedAt)}`);
  } else if (message.openCount > 0) {
    parts.push(
      `${message.openCount} open${message.openCount === 1 ? '' : 's'}`,
    );
  }

  if (message.clickedAt) {
    parts.push(`Clicked ${formatTrackingTimestamp(message.clickedAt)}`);
  } else if (message.clickCount > 0) {
    parts.push(
      `${message.clickCount} click${message.clickCount === 1 ? '' : 's'}`,
    );
  }

  if (message.bouncedAt) {
    parts.push(`Bounced ${formatTrackingTimestamp(message.bouncedAt)}`);
  }

  return parts.join(' · ') || 'Pending';
}

function EventTimelineItem({
  event,
  highlighted,
  isLast,
}: {
  event: CampaignEvent;
  highlighted: boolean;
  isLast: boolean;
}) {
  const { Icon, palette } = EVENT_ICON_CONFIG[event.eventType];
  const subtextLines = formatCampaignEventSubtext(event);

  return (
    <Box className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast ? (
        <Box
          className="absolute left-[15px] top-8 bottom-0 w-px"
          sx={{ bgcolor: 'divider' }}
        />
      ) : null}

      <Box
        className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        sx={(theme) => ({
          bgcolor: alpha(theme.palette[palette].main, 0.12),
          color: `${palette}.main`,
          boxShadow: highlighted
            ? `0 0 0 2px ${alpha(theme.palette[palette].main, 0.28)}`
            : 'none',
        })}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>

      <Box
        className={`min-w-0 flex-1 rounded-xl px-3 py-2 ${
          highlighted ? 'bg-primary-soft/40' : ''
        }`}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography variant="body2" className="font-semibold">
            {CAMPAIGN_EVENT_TYPE_LABELS[event.eventType]}
            {event.stepOrder !== null ? (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                className="font-normal"
              >
                {' '}
                · Step {event.stepOrder}
              </Typography>
            ) : null}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="shrink-0 tabular-nums">
            {formatCampaignEventTimestamp(event.occurredAt)}
          </Typography>
        </Stack>

        {subtextLines.length > 0 ? (
          <Stack spacing={0.25} className="mt-1">
            {subtextLines.map((line) => (
              <Typography
                key={line.text}
                variant="caption"
                color={line.tone === 'error' ? 'error' : 'text.secondary'}
                className="block break-words leading-relaxed"
              >
                {line.text}
              </Typography>
            ))}
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

function EventTimeline({
  events,
  selectedEventId,
}: {
  events: CampaignEvent[];
  selectedEventId: string | null | undefined;
}) {
  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No activity recorded for this contact yet.
      </Typography>
    );
  }

  return (
    <Box className="pt-1">
      {events.map((event, index) => (
        <EventTimelineItem
          key={event.id}
          event={event}
          highlighted={event.id === selectedEventId}
          isLast={index === events.length - 1}
        />
      ))}
    </Box>
  );
}

export default function CampaignActivityDetailDialog({
  open,
  onClose,
  campaignId,
  campaignStatus,
  selectedEvent,
}: CampaignActivityDetailDialogProps) {
  const recipientId = selectedEvent?.recipientId ?? null;
  const recipientEmail = selectedEvent?.recipientEmail ?? '';

  const { data: recipient, isLoading: isRecipientLoading } = useCampaignRecipient(
    open ? campaignId : null,
    open ? recipientId : null,
    { campaignStatus },
  );

  const { data: eventsPage, isLoading: isEventsLoading } = useCampaignRecipientEvents(
    open ? campaignId : null,
    open ? recipientId : null,
    { campaignStatus },
  );

  const timeline = useMemo(() => {
    const items = eventsPage?.items ?? [];
    return [...items].sort(
      (left, right) =>
        new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
    );
  }, [eventsPage?.items]);

  const isLoading = isRecipientLoading || isEventsLoading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="subtitle1" className="truncate font-bold" title={recipientEmail}>
          {recipientEmail}
        </Typography>
        {recipient ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
            <Chip
              label={CAMPAIGN_RECIPIENT_STATUS_LABELS[recipient.engagement.status]}
              color={CAMPAIGN_RECIPIENT_STATUS_COLORS[recipient.engagement.status]}
              size="small"
              className="rounded-lg"
            />
            <Typography variant="caption" color="text.secondary">
              {recipient.engagement.openCount} opens · {recipient.engagement.clickCount} clicks
            </Typography>
          </Stack>
        ) : null}
        <IconButton
          aria-label="Close activity details"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="px-4 py-4 md:px-5">
        {isLoading ? (
          <Stack spacing={1.5}>
            <Skeleton height={48} className="rounded-lg" />
            <Skeleton height={160} className="rounded-lg" />
          </Stack>
        ) : (
          <Stack spacing={3}>
            {recipient && recipient.messages.length > 0 ? (
              <Box className="rounded-xl bg-surface-muted/50 px-3 py-2.5">
                {recipient.messages.map((message) => (
                  <Typography
                    key={message.stepOrder}
                    variant="body2"
                    color="text.secondary"
                    className="leading-relaxed"
                  >
                    <Box component="span" className="font-medium text-foreground">
                      Step {message.stepOrder}
                    </Box>
                    {' · '}
                    {formatStepLine(message)}
                  </Typography>
                ))}
              </Box>
            ) : null}

            <Box>
              <Typography variant="subtitle2" className="mb-1 font-bold">
                Timeline
              </Typography>
              <EventTimeline
                events={timeline}
                selectedEventId={selectedEvent?.id}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

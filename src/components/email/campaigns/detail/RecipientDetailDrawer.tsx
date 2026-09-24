'use client';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCampaignRecipientEvents } from '@/hooks/useEmailCampaigns';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';
import {
  CAMPAIGN_EVENT_TYPE_LABELS,
  type EmailCampaignEventType,
} from '@/lib/email/campaigns/event-types';
import {
  formatCampaignEventDescription,
  formatCampaignEventDetailLines,
  formatCampaignEventTimestamp,
  type CampaignEventDetailLine,
} from '@/lib/email/campaigns/event-utils';
import type { CampaignRecipientDetail } from '@/lib/email/campaigns/recipient-types';
import {
  formatReplyCategoryLabel,
} from '@/lib/email/campaigns/reply-category-utils';
import {
  CAMPAIGN_RECIPIENT_STATUS_COLORS,
  CAMPAIGN_RECIPIENT_STATUS_LABELS,
  formatTrackingTimestamp,
} from '@/lib/email/campaigns/recipient-status-utils';

interface RecipientDetailDrawerProps {
  campaignId: string;
  recipient: CampaignRecipientDetail | null;
  open: boolean;
  onClose: () => void;
  campaignStatus?: EmailCampaignStatus | null;
}

const EVENT_CHIP_COLORS: Record<
  EmailCampaignEventType,
  'default' | 'info' | 'warning' | 'primary' | 'error' | 'success'
> = {
  sent: 'info',
  open: 'warning',
  click: 'primary',
  bounce: 'error',
  send_failed: 'error',
  reply: 'success',
  unsubscribe: 'default',
};

function EventRow({
  eventType,
  description,
  timestamp,
  detailLines,
}: {
  eventType: EmailCampaignEventType;
  description: string;
  timestamp: string;
  detailLines: CampaignEventDetailLine[];
}) {
  return (
    <Box className="dashboard-panel rounded-xl px-3 py-2.5">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box className="min-w-0 flex-1">
          <Typography variant="body2" className="break-words">
            {description}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="block">
            {formatCampaignEventTimestamp(timestamp)}
          </Typography>
          {detailLines.map((line) => (
            <Typography
              key={line.text}
              variant="caption"
              color={line.tone === 'error' ? 'error' : 'text.secondary'}
              className="mt-0.5 block break-words"
            >
              {line.text}
            </Typography>
          ))}
        </Box>
        <Chip
          label={CAMPAIGN_EVENT_TYPE_LABELS[eventType]}
          color={EVENT_CHIP_COLORS[eventType]}
          size="small"
          className="shrink-0"
        />
      </Stack>
    </Box>
  );
}

export default function RecipientDetailDrawer({
  campaignId,
  recipient,
  open,
  onClose,
  campaignStatus,
}: RecipientDetailDrawerProps) {
  const { data: eventsPage, isLoading } = useCampaignRecipientEvents(
    open ? campaignId : null,
    open ? recipient?.id ?? null : null,
    { campaignStatus },
  );

  if (!recipient) {
    return null;
  }

  const status = recipient.engagement.status;
  const events = eventsPage?.items ?? [];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className="flex h-full w-full max-w-md flex-col p-6">
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
        >
          <Box>
            <Typography variant="h6" className="font-bold">
              {recipient.email}
            </Typography>
            <Chip
              label={CAMPAIGN_RECIPIENT_STATUS_LABELS[status]}
              color={CAMPAIGN_RECIPIENT_STATUS_COLORS[status]}
              size="small"
              className="mt-2 rounded-lg"
            />
          </Box>
          <IconButton aria-label="Close recipient details" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1} className="mb-4">
          <Typography variant="caption" color="text.secondary">
            {recipient.engagement.openCount} opens ·{' '}
            {recipient.engagement.clickCount} clicks
          </Typography>
          {recipient.contactDisposition !== 'eligible' ? (
            <Typography variant="caption" color="text.secondary" className="capitalize">
              Disposition: {recipient.contactDisposition.replace('_', ' ')}
            </Typography>
          ) : null}
        </Stack>

        {recipient.messages.length > 0 ? (
          <>
            <Typography variant="subtitle2" className="mb-2 font-bold">
              Sequence steps
            </Typography>
            <Stack spacing={1} className="mb-4">
              {recipient.messages.map((message) => (
                <Box key={message.stepOrder} className="dashboard-panel rounded-xl px-3 py-2.5">
                  <Typography variant="body2" className="font-semibold">
                    Step {message.stepOrder}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="block">
                    {message.deliveryStatus === 'sent'
                      ? `Sent ${message.sentAt ? formatTrackingTimestamp(message.sentAt) : '—'}`
                      : message.deliveryStatus}
                    {message.openCount > 0
                      ? ` · ${message.openCount} open${message.openCount === 1 ? '' : 's'}`
                      : ''}
                    {message.clickCount > 0
                      ? ` · ${message.clickCount} click${message.clickCount === 1 ? '' : 's'}`
                      : ''}
                    {message.bouncedAt
                      ? ` · Bounced ${formatTrackingTimestamp(message.bouncedAt)}`
                      : ''}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        ) : null}

        <Typography variant="subtitle2" className="mb-2 font-bold">
          Activity
        </Typography>

        <Stack spacing={1.5} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading activity…
            </Typography>
          ) : null}

          {!isLoading && events.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No activity recorded for this contact yet.
            </Typography>
          ) : null}

          {events.map((event) => (
            <EventRow
              key={event.id}
              eventType={event.eventType}
              description={formatCampaignEventDescription({
                ...event,
                recipientEmail: recipient.email,
              })}
              timestamp={event.occurredAt}
              detailLines={formatCampaignEventDetailLines(event)}
            />
          ))}

          {recipient.replyCategory ? (
            <Box className="dashboard-panel rounded-2xl p-4">
              <Typography variant="subtitle2" className="font-bold">
                Reply category
              </Typography>
              <Typography variant="body2" className="mt-1">
                {formatReplyCategoryLabel(recipient.replyCategory)}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Drawer>
  );
}

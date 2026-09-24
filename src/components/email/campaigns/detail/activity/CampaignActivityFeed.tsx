'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import CampaignActivityDetailDialog from '@/components/email/campaigns/detail/activity/CampaignActivityDetailDialog';
import { useCampaignEvents } from '@/hooks/useEmailCampaigns';
import {
  CAMPAIGN_EVENT_CHIP_COLORS,
  CAMPAIGN_EVENT_TYPE_LABELS,
  type CampaignEvent,
  CAMPAIGN_EVENT_TYPE_OPTIONS,
  type EmailCampaignEventType,
} from '@/lib/email/campaigns/event-types';
import {
  formatCampaignEventDescription,
  formatCampaignEventTimestamp,
} from '@/lib/email/campaigns/event-utils';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface CampaignActivityFeedProps {
  campaignId: string;
  campaignStatus: EmailCampaignStatus;
}

function formatEventAction(event: CampaignEvent): string {
  const description = formatCampaignEventDescription(event);
  return description.replace(`${event.recipientEmail} `, '');
}

export default function CampaignActivityFeed({
  campaignId,
  campaignStatus,
}: CampaignActivityFeedProps) {
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState<EmailCampaignEventType | ''>('');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<CampaignEvent | null>(null);
  const limit = 50;

  const eventsQuery = useMemo(
    () => ({
      search,
      eventType: eventType || undefined,
      page,
      limit,
    }),
    [search, eventType, page],
  );

  const { data: eventsPage, isLoading } = useCampaignEvents(
    campaignId,
    eventsQuery,
    { campaignStatus },
  );

  const totalPages = eventsPage
    ? Math.max(1, Math.ceil(eventsPage.total / eventsPage.limit))
    : 1;

  const hasItems = (eventsPage?.items.length ?? 0) > 0;

  return (
    <>
      <Stack spacing={2}>
        <Box className="dashboard-panel rounded-2xl px-4 py-3 md:px-5">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' } }}
          >
            <TextField
              label="Search by email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              fullWidth
              sx={{ flex: { md: 1 }, minWidth: 0 }}
            />
            <TextField
              select
              label="Event type"
              value={eventType}
              onChange={(event) => {
                setEventType(event.target.value as EmailCampaignEventType | '');
                setPage(1);
              }}
              size="small"
              sx={{
                width: { xs: '100%', md: 220 },
                flexShrink: 0,
              }}
            >
              {CAMPAIGN_EVENT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.label} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <Box className="dashboard-panel overflow-hidden rounded-2xl">
          <Box className="hidden border-b border-surface-border px-4 py-2 md:block md:px-5">
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center' }}
              className="text-xs font-semibold uppercase tracking-wide text-text-secondary"
            >
              <Box sx={{ width: '9rem', flexShrink: 0 }}>Time</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>Contact</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>Action</Box>
              <Box sx={{ width: '5.5rem', flexShrink: 0, textAlign: 'right' }}>Type</Box>
            </Stack>
          </Box>

          {isLoading ? (
            <Stack spacing={0} className="px-4 py-2 md:px-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} height={44} className="my-1 rounded-lg" />
              ))}
            </Stack>
          ) : null}

          {!isLoading && !hasItems ? (
            <Box className="px-4 py-8 text-center md:px-5">
              <Typography variant="body2" color="text.secondary">
                No activity recorded yet. Events appear here when emails are sent,
                opened, clicked, bounced, replied to, or unsubscribed.
              </Typography>
            </Box>
          ) : null}

          {!isLoading && hasItems ? (
            <Stack divider={<Box className="border-t border-surface-border" />}>
              {eventsPage?.items.map((event) => (
                <Box
                  key={event.id}
                  component="button"
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 md:items-center md:px-5"
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="hidden shrink-0 md:block md:w-36"
                  >
                    {formatCampaignEventTimestamp(event.occurredAt)}
                  </Typography>

                  <Box className="min-w-0 flex-1">
                    <Typography variant="body2" className="truncate font-medium">
                      {event.recipientEmail}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" className="md:hidden">
                      {formatCampaignEventTimestamp(event.occurredAt)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="mt-0.5 block truncate md:hidden"
                    >
                      {formatEventAction(event)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="hidden min-w-0 flex-1 truncate md:block"
                  >
                    {formatEventAction(event)}
                  </Typography>

                  <Chip
                    label={CAMPAIGN_EVENT_TYPE_LABELS[event.eventType]}
                    color={CAMPAIGN_EVENT_CHIP_COLORS[event.eventType]}
                    size="small"
                    className="shrink-0 capitalize"
                  />
                </Box>
              ))}
            </Stack>
          ) : null}
        </Box>

        {eventsPage && eventsPage.total > limit ? (
          <Box className="flex justify-center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        ) : null}
      </Stack>

      <CampaignActivityDetailDialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        campaignId={campaignId}
        campaignStatus={campaignStatus}
        selectedEvent={selectedEvent}
      />
    </>
  );
}

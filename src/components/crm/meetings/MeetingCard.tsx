'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  buildProspectSubtitle,
  formatMeetingDateTime,
  renderMeetingPlatformChip,
  renderMeetingStatusChip,
} from '@/components/crm/meetings/meeting-renderers';
import type { Meeting } from '@/lib/crm/meetings/types';

interface MeetingCardProps {
  meeting: Meeting;
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: (meetingId: string) => Promise<void>;
}

export default function MeetingCard({
  meeting,
  canCancel,
  isCancelling,
  onCancel,
}: MeetingCardProps) {
  const subtitle = buildProspectSubtitle(
    meeting.prospect.designation,
    meeting.prospect.product,
  );

  return (
    <Paper className="flex h-full flex-col rounded-2xl border border-border/60 p-5">
      <Stack spacing={2} className="flex-1">
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Stack spacing={0.5} className="min-w-0 flex-1">
            <Typography variant="subtitle1" className="truncate font-bold">
              {meeting.title ?? 'Untitled meeting'}
            </Typography>
            <Typography variant="body2" className="font-semibold">
              {meeting.prospect.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle ? `${subtitle} · ${meeting.prospect.email}` : meeting.prospect.email}
            </Typography>
          </Stack>
          {renderMeetingStatusChip(meeting.status)}
        </Stack>

        <Stack direction="row" spacing={1} className="flex-wrap gap-y-1">
          {renderMeetingPlatformChip(meeting.platform)}
        </Stack>

        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
            Schedule
          </Typography>
          <Typography variant="body2">
            Start: {formatMeetingDateTime(meeting.startAt)}
          </Typography>
          <Typography variant="body2">
            End: {formatMeetingDateTime(meeting.endAt)}
          </Typography>
          {meeting.meetingUrl ? (
            <Typography
              variant="body2"
              component="a"
              href={meeting.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 underline"
            >
              Join meeting
            </Typography>
          ) : null}
        </Stack>
      </Stack>

      {canCancel && meeting.status === 'scheduled' ? (
        <Button
          size="small"
          color="error"
          variant="outlined"
          className="mt-4 self-start"
          disabled={isCancelling}
          onClick={() => void onCancel(meeting.id)}
        >
          Cancel meeting
        </Button>
      ) : null}
    </Paper>
  );
}

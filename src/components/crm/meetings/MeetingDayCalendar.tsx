'use client';

import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import {
  buildHourLabels,
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_HOUR_HEIGHT_PX,
  formatCalendarDayLabel,
  formatCalendarTime,
  getEventBlockStyle,
} from '@/lib/crm/meetings/scheduling';
import type {
  MeetingCalendarItem,
  MeetingComposerDraft,
} from '@/lib/crm/meetings/types';

interface MeetingDayCalendarProps {
  selectedDay: DateTime;
  meetings: MeetingCalendarItem[];
  draft?: MeetingComposerDraft | null;
  onDayChange: (nextDay: DateTime) => void;
}

function formatHourLabel(hour: number): string {
  return DateTime.fromObject({ hour }).toFormat('h a');
}

export default function MeetingDayCalendar({
  selectedDay,
  meetings,
  draft,
  onDayChange,
}: MeetingDayCalendarProps) {
  const hours = buildHourLabels();
  const gridHeight =
    (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR + 1) *
    CALENDAR_HOUR_HEIGHT_PX;

  const dayMeetings = meetings.filter((meeting) => {
    const start = DateTime.fromISO(meeting.startAt);
    return start.hasSame(selectedDay, 'day');
  });

  const draftStyle =
    draft && getEventBlockStyle(draft.startAt, draft.endAt, selectedDay);

  return (
    <Box className="flex h-full min-h-[520px] flex-col rounded-2xl border border-border/60 bg-surface p-4">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <IconButton
          size="small"
          aria-label="Previous day"
          onClick={() => onDayChange(selectedDay.minus({ days: 1 }))}
        >
          <ChevronLeftOutlinedIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" className="font-semibold">
          {formatCalendarDayLabel(selectedDay)}
        </Typography>
        <IconButton
          size="small"
          aria-label="Next day"
          onClick={() => onDayChange(selectedDay.plus({ days: 1 }))}
        >
          <ChevronRightOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box className="relative flex flex-1 overflow-y-auto">
        <Box className="w-14 shrink-0 pr-2">
          {hours.map((hour) => (
            <Box
              key={hour}
              sx={{ height: CALENDAR_HOUR_HEIGHT_PX }}
              className="flex items-start justify-end"
            >
              <Typography variant="caption" color="text.secondary">
                {formatHourLabel(hour)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box className="relative flex-1 border-l border-border/50">
          {hours.map((hour) => (
            <Box
              key={hour}
              sx={{ height: CALENDAR_HOUR_HEIGHT_PX }}
              className="border-b border-border/30"
            />
          ))}

          <Box
            className="absolute inset-0"
            sx={{ height: gridHeight }}
          >
            {dayMeetings.map((meeting) => {
              const style = getEventBlockStyle(
                meeting.startAt,
                meeting.endAt,
                selectedDay,
              );

              if (!style) {
                return null;
              }

              return (
                <Box
                  key={meeting.id}
                  className="absolute left-1 right-1 overflow-hidden rounded-lg border border-indigo-200/70 bg-indigo-500/15 px-2 py-1"
                  sx={{ top: style.top, height: style.height }}
                >
                  <Typography variant="caption" className="block font-semibold">
                    {meeting.title ?? 'Meeting'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCalendarTime(DateTime.fromISO(meeting.startAt))}
                  </Typography>
                </Box>
              );
            })}

            {draftStyle ? (
              <Box
                className="absolute left-1 right-1 overflow-hidden rounded-lg border border-rose-400/80 bg-rose-500/20 px-2 py-1"
                sx={{ top: draftStyle.top, height: draftStyle.height }}
              >
                <Typography variant="caption" className="block font-semibold">
                  {draft?.title?.trim() || 'New meeting'}
                </Typography>
                {draft ? (
                  <Typography variant="caption" color="text.secondary">
                    {formatCalendarTime(DateTime.fromISO(draft.startAt))}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

'use client';

import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import {
  formatCalendarDayLabel,
  formatCalendarTime,
  startOfWeek,
} from '@/lib/crm/meetings/scheduling';
import { getMeetingPlatformConfig } from '@/lib/crm/meetings/platform-config';
import type { MeetingCalendarItem } from '@/lib/crm/meetings/types';

interface MeetingsCalendarViewProps {
  meetings: MeetingCalendarItem[];
  isLoading: boolean;
}

function buildWeekDays(anchor: DateTime): DateTime[] {
  const weekStart = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) =>
    weekStart.plus({ days: index }),
  );
}

export default function MeetingsCalendarView({
  meetings,
  isLoading,
}: MeetingsCalendarViewProps) {
  const [anchorDay, setAnchorDay] = useState<DateTime>(() =>
    DateTime.now().startOf('day'),
  );
  const weekDays = useMemo(() => buildWeekDays(anchorDay), [anchorDay]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          size="small"
          aria-label="Previous week"
          onClick={() => setAnchorDay((current) => current.minus({ weeks: 1 }))}
        >
          <ChevronLeftOutlinedIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle1" className="font-semibold">
          Week of {formatCalendarDayLabel(weekDays[0]!)}
        </Typography>
        <IconButton
          size="small"
          aria-label="Next week"
          onClick={() => setAnchorDay((current) => current.plus({ weeks: 1 }))}
        >
          <ChevronRightOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {isLoading ? (
        <Box className="rounded-2xl border border-border/60 px-6 py-16 text-center">
          <Typography variant="body2" color="text.secondary">
            Loading calendar...
          </Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {weekDays.map((day) => {
            const dayMeetings = meetings.filter((meeting) =>
              DateTime.fromISO(meeting.startAt).hasSame(day, 'day'),
            );

            return (
              <Paper
                key={day.toISODate()}
                className="rounded-2xl border border-border/60 p-4"
              >
                <Typography variant="subtitle2" className="mb-3 font-semibold">
                  {day.toFormat('ccc d LLL')}
                </Typography>

                {dayMeetings.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No meetings
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {dayMeetings.map((meeting) => {
                      const config = getMeetingPlatformConfig(meeting.platform);
                      const start = DateTime.fromISO(meeting.startAt);
                      const end = DateTime.fromISO(meeting.endAt);

                      return (
                        <Box
                          key={meeting.id}
                          className="rounded-xl border border-indigo-200/70 bg-indigo-500/10 px-3 py-2"
                        >
                          <Typography variant="body2" className="font-semibold">
                            {meeting.title ?? 'Untitled meeting'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCalendarTime(start)} - {formatCalendarTime(end)}
                          </Typography>
                          <Typography variant="caption" className="mt-1 block">
                            {meeting.prospect.name} · {config.label}
                          </Typography>
                          {meeting.meetingUrl ? (
                            <Typography
                              variant="caption"
                              component="a"
                              href={meeting.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 block text-indigo-400 underline"
                            >
                              Join link
                            </Typography>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            );
          })}
        </div>
      )}
    </Stack>
  );
}

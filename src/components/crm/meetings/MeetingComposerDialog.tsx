'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import CalendarConnectionBanner from '@/components/crm/meetings/CalendarConnectionBanner';
import MeetingDayCalendar from '@/components/crm/meetings/MeetingDayCalendar';
import MeetingPlatformPicker from '@/components/crm/meetings/MeetingPlatformPicker';
import { useCalendarConnections } from '@/hooks/useCalendarConnections';
import { useMeetingsCalendar } from '@/hooks/useMeetings';
import { useProspectSearch } from '@/hooks/useProspects';
import {
  buildDefaultMeetingWindow,
  endOfDayIso,
  getBrowserTimeZone,
  startOfDayIso,
  toIsoDateTime,
} from '@/lib/crm/meetings/scheduling';
import type {
  CreateMeetingInput,
  MeetingPlatform,
} from '@/lib/crm/meetings/types';
import type { ProspectSearchResult } from '@/lib/crm/prospects/types';

interface MeetingComposerDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateMeetingInput) => Promise<void>;
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      className="mb-1.5 block font-semibold uppercase tracking-wide"
    >
      {children}
      {required ? ' *' : ''}
    </Typography>
  );
}

export default function MeetingComposerDialog({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: MeetingComposerDialogProps) {
  const defaultWindow = useMemo(() => buildDefaultMeetingWindow(), []);
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectSearchResult | null>(null);
  const [platform, setPlatform] = useState<MeetingPlatform | null>(null);
  const [selectedDay, setSelectedDay] = useState<DateTime>(defaultWindow.startAt);
  const [startAt, setStartAt] = useState<DateTime>(defaultWindow.startAt);
  const [endAt, setEndAt] = useState<DateTime>(defaultWindow.endAt);
  const [description, setDescription] = useState('');
  const [agenda, setAgenda] = useState('');

  const {
    connections,
    availability,
    disconnect,
    isDisconnecting,
    refetch: refetchConnections,
  } = useCalendarConnections();

  const calendarQuery = useMemo(
    () =>
      open
        ? {
            from: startOfDayIso(selectedDay),
            to: endOfDayIso(selectedDay),
          }
        : null,
    [open, selectedDay],
  );

  const { data: calendarMeetingsData, refetch: refetchCalendarMeetings } =
    useMeetingsCalendar(calendarQuery);
  const calendarMeetings = calendarMeetingsData ?? [];

  const { data, isLoading: isSearching } = useProspectSearch(
    search,
    open && !selectedProspect,
  );
  const searchResults = data ?? [];

  useEffect(() => {
    if (open) {
      void refetchConnections();
    }
  }, [open, refetchConnections]);

  const isPlatformConnected = platform
    ? connections.some((connection) => connection.provider === platform)
    : false;

  const draft =
    startAt.isValid && endAt.isValid
      ? {
          title,
          startAt: toIsoDateTime(startAt),
          endAt: toIsoDateTime(endAt),
        }
      : null;

  function resetForm() {
    const nextWindow = buildDefaultMeetingWindow();
    setTitle('');
    setSearch('');
    setSelectedProspect(null);
    setPlatform(null);
    setSelectedDay(nextWindow.startAt);
    setStartAt(nextWindow.startAt);
    setEndAt(nextWindow.endAt);
    setDescription('');
    setAgenda('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!selectedProspect || !platform || !startAt.isValid || !endAt.isValid) {
      return;
    }

    await onSubmit({
      prospectId: selectedProspect.id,
      platform,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      agenda: agenda.trim() || undefined,
      startAt: toIsoDateTime(startAt),
      endAt: toIsoDateTime(endAt),
      timeZone: getBrowserTimeZone(),
    });

    resetForm();
    await refetchCalendarMeetings();
  }

  function handleStartChange(nextValue: DateTime | null) {
    if (!nextValue?.isValid) {
      return;
    }

    setStartAt(nextValue);
    setSelectedDay(nextValue.startOf('day'));

    if (endAt <= nextValue) {
      setEndAt(nextValue.plus({ minutes: 30 }));
    }
  }

  function handleEndChange(nextValue: DateTime | null) {
    if (!nextValue?.isValid) {
      return;
    }

    setEndAt(nextValue);
    setSelectedDay(nextValue.startOf('day'));
  }

  function handleDateChange(nextValue: DateTime | null) {
    if (!nextValue?.isValid) {
      return;
    }

    setSelectedDay(nextValue.startOf('day'));
    setStartAt(
      nextValue.set({
        hour: startAt.hour,
        minute: startAt.minute,
        second: 0,
        millisecond: 0,
      }),
    );
    setEndAt(
      nextValue.set({
        hour: endAt.hour,
        minute: endAt.minute,
        second: 0,
        millisecond: 0,
      }),
    );
  }

  const submitDisabled =
    !selectedProspect ||
    !platform ||
    !isPlatformConnected ||
    !startAt.isValid ||
    !endAt.isValid ||
    endAt <= startAt ||
    isSubmitting;

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        aria-labelledby="meeting-composer-title"
      >
        <DialogTitle id="meeting-composer-title" className="pb-2">
          <Typography variant="h6" component="span" className="font-bold">
            Schedule Meeting
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Create a meeting, send a calendar invite, and preview the time on your
            day calendar.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <Stack spacing={3}>
              <Box>
                <FieldLabel required>Title</FieldLabel>
                <TextField
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Add title"
                  fullWidth
                  size="small"
                  disabled={isSubmitting}
                />
              </Box>

              <Box>
                <FieldLabel required>Invite required attendee</FieldLabel>
                {selectedProspect ? (
                  <Box className="rounded-xl border border-border/60 p-3">
                    <Typography variant="body2" className="font-semibold">
                      {selectedProspect.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedProspect.email}
                    </Typography>
                    <Button
                      size="small"
                      className="mt-2"
                      onClick={() => setSelectedProspect(null)}
                      disabled={isSubmitting}
                    >
                      Change
                    </Button>
                  </Box>
                ) : (
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email..."
                    fullWidth
                    size="small"
                    disabled={isSubmitting}
                  />
                )}
                {!selectedProspect && search.trim().length >= 2 ? (
                  <List
                    dense
                    className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border/60"
                  >
                    {isSearching ? (
                      <ListItemText
                        primary="Searching..."
                        className="px-3 py-2"
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    ) : searchResults.length === 0 ? (
                      <ListItemText
                        primary="No prospects found"
                        className="px-3 py-2"
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    ) : (
                      searchResults.map((result) => (
                        <ListItemButton
                          key={result.id}
                          onClick={() => setSelectedProspect(result)}
                        >
                          <ListItemText
                            primary={result.fullName}
                            secondary={result.email}
                          />
                        </ListItemButton>
                      ))
                    )}
                  </List>
                ) : null}
              </Box>

              <Box>
                <FieldLabel required>Date and time</FieldLabel>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <DatePicker
                    value={selectedDay}
                    onChange={handleDateChange}
                    disabled={isSubmitting}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  <TimePicker
                    label="Start"
                    value={startAt}
                    onChange={handleStartChange}
                    disabled={isSubmitting}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  <TimePicker
                    label="End"
                    value={endAt}
                    onChange={handleEndChange}
                    disabled={isSubmitting}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Stack>
              </Box>

              <Box>
                <FieldLabel required>Platform</FieldLabel>
                <MeetingPlatformPicker
                  value={platform}
                  disabled={isSubmitting}
                  onChange={setPlatform}
                />
                <Box className="mt-3">
                  <CalendarConnectionBanner
                    platform={platform}
                    connections={connections}
                    availability={availability ?? undefined}
                    isDisconnecting={isDisconnecting}
                    onDisconnect={disconnect}
                  />
                </Box>
              </Box>

              <Box>
                <FieldLabel>Description</FieldLabel>
                <TextField
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add meeting details"
                  fullWidth
                  multiline
                  minRows={4}
                  disabled={isSubmitting}
                />
              </Box>

              <Box>
                <FieldLabel>Agenda</FieldLabel>
                <TextField
                  value={agenda}
                  onChange={(event) => setAgenda(event.target.value)}
                  placeholder="Add an agenda"
                  fullWidth
                  size="small"
                  disabled={isSubmitting}
                />
              </Box>
            </Stack>

            <MeetingDayCalendar
              selectedDay={selectedDay}
              meetings={calendarMeetings}
              draft={draft}
              onDayChange={(nextDay) => {
                setSelectedDay(nextDay.startOf('day'));
                setStartAt(
                  nextDay.set({
                    hour: startAt.hour,
                    minute: startAt.minute,
                    second: 0,
                    millisecond: 0,
                  }),
                );
                setEndAt(
                  nextDay.set({
                    hour: endAt.hour,
                    minute: endAt.minute,
                    second: 0,
                    millisecond: 0,
                  }),
                );
              }}
            />
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitDisabled}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

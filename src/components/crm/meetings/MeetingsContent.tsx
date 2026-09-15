'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import DataTablePagination from '@/components/data-table/DataTablePagination';
import CrmHubShell from '@/components/crm/CrmHubShell';
import { CalendarConnectionStatusBar } from '@/components/crm/meetings/CalendarConnectionBanner';
import MeetingCard from '@/components/crm/meetings/MeetingCard';
import MeetingComposerDialog from '@/components/crm/meetings/MeetingComposerDialog';
import MeetingsCalendarView from '@/components/crm/meetings/MeetingsCalendarView';
import MeetingsSummaryCards from '@/components/crm/meetings/MeetingsSummaryCards';
import MeetingsTable from '@/components/crm/meetings/MeetingsTable';
import MeetingsToolbar from '@/components/crm/meetings/MeetingsToolbar';
import { useCalendarConnections } from '@/hooks/useCalendarConnections';
import {
  useMeetingMutations,
  useMeetings,
  useMeetingsCalendar,
  useMeetingsSummary,
} from '@/hooks/useMeetings';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import {
  endOfWeek,
  formatCalendarRange,
  startOfWeek,
  toIsoDateTime,
} from '@/lib/crm/meetings/scheduling';
import type {
  CreateMeetingInput,
  MeetingListStatus,
  MeetingViewMode,
} from '@/lib/crm/meetings/types';

const VIEW_MODE_STORAGE_KEY = 'meetings.viewMode';

function readStoredViewMode(): MeetingViewMode {
  if (typeof window === 'undefined') {
    return 'table';
  }

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  if (stored === 'cards' || stored === 'calendar') {
    return stored;
  }

  return 'table';
}

export default function MeetingsContent() {
  const searchParams = useSearchParams();
  const { notifyError, notifySuccess } = useNotify();
  const canRead = useHasPermission('meetings:read');
  const canCreate = useHasPermission('meetings:create');
  const canUpdate = useHasPermission('meetings:update');

  const [activeStatus, setActiveStatus] = useState<MeetingListStatus>('all');
  const [viewMode, setViewMode] = useState<MeetingViewMode>(() =>
    readStoredViewMode(),
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [createOpen, setCreateOpen] = useState(false);
  const [cancellingMeetingId, setCancellingMeetingId] = useState<string | null>(
    null,
  );

  const {
    connections,
    availability,
    refetch: refetchConnections,
  } = useCalendarConnections();

  const calendarRange = useMemo(() => {
    const anchor = DateTime.now();
    return {
      from: toIsoDateTime(startOfWeek(anchor)),
      to: toIsoDateTime(endOfWeek(anchor)),
    };
  }, []);

  const {
    data: meetingsPage,
    isLoading: isMeetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useMeetings({
    status: activeStatus,
    page,
    pageSize,
  });

  const {
    data: calendarMeetingsData,
    isLoading: isCalendarLoading,
    refetch: refetchCalendarMeetings,
  } = useMeetingsCalendar(viewMode === 'calendar' ? calendarRange : null);
  const calendarMeetings = calendarMeetingsData ?? [];

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useMeetingsSummary();

  const { createMeeting, cancelMeeting, isCreating, isCancelling } =
    useMeetingMutations();

  const meetings = meetingsPage?.items ?? [];
  const total = meetingsPage?.total ?? 0;
  const isLoading = isMeetingsLoading;

  useEffect(() => {
    const oauthStatus = searchParams.get('calendarOAuth');
    if (!oauthStatus) {
      return;
    }

    if (oauthStatus === 'success') {
      const provider = searchParams.get('provider') ?? 'account';
      notifySuccess(`${provider} connected successfully`);
      void refetchConnections();
    } else if (oauthStatus === 'error') {
      notifyError(
        searchParams.get('message') ?? 'Unable to connect calendar account',
      );
    }
  }, [notifyError, notifySuccess, refetchConnections, searchParams]);

  function handleStatusChange(status: MeetingListStatus) {
    setActiveStatus(status);
    setPage(1);
  }

  function handleViewModeChange(nextViewMode: MeetingViewMode) {
    setViewMode(nextViewMode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextViewMode);
  }

  async function refreshMeetings() {
    await Promise.all([
      refetchMeetings(),
      refetchSummary(),
      refetchCalendarMeetings(),
      refetchConnections(),
    ]);
  }

  async function handleCreateMeeting(input: CreateMeetingInput) {
    try {
      await createMeeting(input);
      setCreateOpen(false);
      setPage(1);
      await refreshMeetings();
      notifySuccess(
        `Meeting scheduled for ${formatCalendarRange(input.startAt, input.endAt)}`,
      );
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to create meeting'));
    }
  }

  async function handleCancelMeeting(meetingId: string) {
    setCancellingMeetingId(meetingId);

    try {
      await cancelMeeting(meetingId);
      await refreshMeetings();
      notifySuccess('Meeting cancelled');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to cancel meeting'));
    } finally {
      setCancellingMeetingId(null);
    }
  }

  const headerActions = canCreate ? (
    <Button
      variant="contained"
      startIcon={<AddOutlinedIcon />}
      onClick={() => setCreateOpen(true)}
    >
      Schedule Meeting
    </Button>
  ) : null;

  if (!canRead) {
    return (
      <CrmHubShell>
        <Alert severity="warning">
          You do not have permission to view meetings.
        </Alert>
      </CrmHubShell>
    );
  }

  return (
    <CrmHubShell actions={headerActions}>
      <Stack spacing={3}>
        <MeetingsSummaryCards
          summary={summary ?? undefined}
          isLoading={isSummaryLoading}
        />

        {canCreate ? (
          <CalendarConnectionStatusBar
            connections={connections}
            availability={availability ?? undefined}
          />
        ) : null}

        <MeetingsToolbar
          activeStatus={activeStatus}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
          onViewModeChange={handleViewModeChange}
        />

        {meetingsError ? (
          <Alert severity="error">
            {getApiErrorMessage(meetingsError, 'Unable to load meetings')}
          </Alert>
        ) : null}

        {viewMode === 'calendar' ? (
          <MeetingsCalendarView
            meetings={calendarMeetings}
            isLoading={isCalendarLoading}
          />
        ) : viewMode === 'table' ? (
          <MeetingsTable
            meetings={meetings}
            isLoading={isLoading}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        ) : isLoading ? (
          <Box className="flex justify-center py-16">
            <CircularProgress size={28} />
          </Box>
        ) : meetings.length === 0 ? (
          <Box className="rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
            <Typography variant="body1" color="text.secondary">
              No meetings yet. Schedule your first meeting to get started.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  canCancel={canUpdate}
                  isCancelling={
                    isCancelling && cancellingMeetingId === meeting.id
                  }
                  onCancel={handleCancelMeeting}
                />
              ))}
            </div>
            <DataTablePagination
              page={page - 1}
              pageSize={pageSize}
              totalRows={total}
              onPageChange={(nextPage) => setPage(nextPage + 1)}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
            />
          </Stack>
        )}
      </Stack>

      <MeetingComposerDialog
        open={createOpen}
        isSubmitting={isCreating}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateMeeting}
      />
    </CrmHubShell>
  );
}

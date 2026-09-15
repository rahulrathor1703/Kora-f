'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { meetingsService } from '@/lib/api/services/meetings.service';
import type {
  CreateMeetingInput,
  MeetingsCalendarQuery,
  MeetingsQuery,
} from '@/lib/crm/meetings/types';

export function useMeetings(query: MeetingsQuery) {
  const queryKey = [
    'meetings.list',
    query.status ?? 'all',
    query.q ?? '',
    query.page ?? 1,
    query.pageSize ?? 25,
  ].join('.');

  return useApiQuery(queryKey, () => meetingsService.getMeetings(query));
}

export function useMeetingsCalendar(query: MeetingsCalendarQuery | null) {
  const queryKey = query
    ? ['meetings.calendar', query.from, query.to].join('.')
    : 'meetings.calendar.disabled';

  return useApiQuery(
    queryKey,
    () => {
      if (!query) {
        return Promise.resolve([]);
      }

      return meetingsService.getCalendarMeetings(query);
    },
    { enabled: Boolean(query) },
  );
}

export function useMeetingsSummary() {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(`meetings.summary.${orgScopeKey}`, () =>
    meetingsService.getSummary(),
  );
}

export function useMeetingMutations() {
  const {
    mutate: createMeetingMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateMeetingInput) =>
    meetingsService.createMeeting(input),
  );

  const {
    mutate: cancelMeetingMutate,
    isLoading: isCancelling,
    error: cancelError,
  } = useApiMutation((id: string) => meetingsService.cancelMeeting(id));

  const createMeeting = useCallback(
    (input: CreateMeetingInput) => createMeetingMutate(input),
    [createMeetingMutate],
  );

  const cancelMeeting = useCallback(
    (id: string) => cancelMeetingMutate(id),
    [cancelMeetingMutate],
  );

  return {
    createMeeting,
    cancelMeeting,
    isCreating,
    isCancelling,
    createError,
    cancelError,
  };
}

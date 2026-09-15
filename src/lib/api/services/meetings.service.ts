import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateMeetingInput,
  Meeting,
  MeetingCalendarItem,
  MeetingsCalendarQuery,
  MeetingsPage,
  MeetingsQuery,
  MeetingsSummary,
} from '@/lib/crm/meetings/types';

function buildMeetingsQuery(query: MeetingsQuery = {}): string {
  const params = new URLSearchParams();

  if (query.status && query.status !== 'all') {
    params.set('status', query.status);
  }

  if (query.q?.trim()) {
    params.set('q', query.q.trim());
  }

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function buildCalendarQuery(query: MeetingsCalendarQuery): string {
  const params = new URLSearchParams({
    from: query.from,
    to: query.to,
  });

  return `?${params.toString()}`;
}

export const meetingsService = {
  getMeetings(query?: MeetingsQuery) {
    return apiClient.get<MeetingsPage>(
      `${ENDPOINTS.meetings.list}${buildMeetingsQuery(query)}`,
    );
  },

  getCalendarMeetings(query: MeetingsCalendarQuery) {
    return apiClient.get<MeetingCalendarItem[]>(
      `${ENDPOINTS.meetings.calendar}${buildCalendarQuery(query)}`,
    );
  },

  getSummary() {
    return apiClient.get<MeetingsSummary>(ENDPOINTS.meetings.summary);
  },

  createMeeting(input: CreateMeetingInput) {
    return apiClient.post<Meeting>(ENDPOINTS.meetings.list, input);
  },

  cancelMeeting(id: string) {
    return apiClient.patch<Meeting>(ENDPOINTS.meetings.cancel(id));
  },
};

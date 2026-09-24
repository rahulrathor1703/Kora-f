export const MEETING_PLATFORMS = ['google', 'outlook', 'zoom'] as const;

export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

export const CALENDAR_CONNECTION_PROVIDERS = [
  'google',
  'outlook',
  'zoom',
] as const;

export type CalendarConnectionProvider =
  (typeof CALENDAR_CONNECTION_PROVIDERS)[number];

export const MEETING_STATUSES = [
  'scheduled',
  'completed',
  'cancelled',
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_LIST_STATUSES = [
  'all',
  'upcoming',
  'past',
  'cancelled',
] as const;

export type MeetingListStatus = (typeof MEETING_LIST_STATUSES)[number];

export type MeetingViewMode = 'table' | 'cards' | 'calendar';

export interface MeetingProspectSummary {
  id: string;
  name: string;
  email: string;
  designation?: string;
  product?: string;
}

export interface Meeting {
  id: string;
  prospectId: string;
  platform: MeetingPlatform;
  status: MeetingStatus;
  title: string | null;
  startAt: string | null;
  endAt: string | null;
  description: string | null;
  agenda: string | null;
  meetingUrl: string | null;
  createdAt: string;
  prospect: MeetingProspectSummary;
}

export interface MeetingCalendarItem {
  id: string;
  title: string | null;
  platform: MeetingPlatform;
  status: MeetingStatus;
  startAt: string;
  endAt: string;
  meetingUrl: string | null;
  prospect: MeetingProspectSummary;
}

export interface MeetingsPage {
  items: Meeting[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MeetingsSummary {
  total: number;
  upcoming: number;
  past: number;
  cancelled: number;
}

export interface MeetingsQuery {
  status?: MeetingListStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface MeetingsCalendarQuery {
  from: string;
  to: string;
}

export interface CreateMeetingInput {
  prospectId: string;
  platform: MeetingPlatform;
  startAt: string;
  endAt: string;
  title?: string;
  description?: string;
  agenda?: string;
  timeZone?: string;
}

export interface CalendarConnection {
  provider: CalendarConnectionProvider;
  email: string;
  connectedAt: string;
  expiresAt: string | null;
}

export type CalendarConnectionAvailability = Record<
  CalendarConnectionProvider,
  boolean
>;

export interface MeetingComposerDraft {
  title: string;
  startAt: string;
  endAt: string;
}

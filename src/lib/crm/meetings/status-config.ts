import type { MeetingListStatus, MeetingStatus } from '@/lib/crm/meetings/types';

export const MEETING_LIST_STATUS_LABELS: Record<MeetingListStatus, string> = {
  all: 'All',
  upcoming: 'Upcoming',
  past: 'Past',
  cancelled: 'Cancelled',
};

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const MEETING_STATUS_COLORS: Record<
  MeetingStatus,
  'default' | 'primary' | 'success' | 'error' | 'warning'
> = {
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'error',
};

export const MEETING_SUMMARY_LABELS = {
  total: 'Total meetings',
  upcoming: 'Upcoming',
  past: 'Past',
  cancelled: 'Cancelled',
} as const;

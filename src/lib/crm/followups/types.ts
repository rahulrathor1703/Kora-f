import type { ProspectsPage } from '@/lib/crm/prospects/types';

export const FOLLOW_UP_RANGES = [
  'overdue',
  'today',
  'week',
  'month',
  'all',
] as const;

export type FollowUpRange = (typeof FOLLOW_UP_RANGES)[number];

export interface FollowUpsQuery {
  range: FollowUpRange;
  page?: number;
  pageSize?: number;
}

export type FollowUpsPage = ProspectsPage;

export const FOLLOW_UP_RANGE_LABELS: Record<FollowUpRange, string> = {
  overdue: 'Overdue',
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All',
};

export const EMPTY_FOLLOW_UP_MESSAGES: Record<FollowUpRange, string> = {
  overdue: 'No overdue follow-ups. You are all caught up.',
  today: 'No follow-ups due today.',
  week: 'No follow-ups scheduled this week.',
  month: 'No follow-ups scheduled this month.',
  all: 'No follow-ups scheduled yet.',
};

export const NO_FOLLOW_UP_FIELD_MESSAGE =
  'No follow-up date field found. Add a date field named Follow-up Due in Manage Fields.';

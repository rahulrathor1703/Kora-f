import type { CampaignEvent } from './event-types';
import type { CampaignDailyActivityPoint } from './progress-types';

export interface DailyActivityPoint {
  label: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
}

const EVENT_FIELD_MAP: Record<
  CampaignEvent['eventType'],
  keyof Omit<DailyActivityPoint, 'label'> | null
> = {
  sent: 'sent',
  open: 'opened',
  click: 'clicked',
  reply: 'replied',
  bounce: 'bounced',
  unsubscribe: 'unsubscribed',
  send_failed: null,
};

function createEmptyDailyCounts(): Omit<DailyActivityPoint, 'label'> {
  return {
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
  };
}

function toDayKey(occurredAt: string): string {
  return new Date(occurredAt).toISOString().slice(0, 10);
}

function formatDayLabel(dayKey: string): string {
  const date = new Date(`${dayKey}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function mapDailyActivityPoints(
  points: CampaignDailyActivityPoint[],
): DailyActivityPoint[] {
  return points.map((point) => ({
    label: formatDayLabel(point.date),
    sent: point.sent,
    opened: point.opened,
    clicked: point.clicked,
    replied: point.replied,
    bounced: point.bounced,
    unsubscribed: point.unsubscribed,
  }));
}

export function aggregateEventsByDay(events: CampaignEvent[]): DailyActivityPoint[] {
  const buckets = new Map<string, Omit<DailyActivityPoint, 'label'>>();

  for (const event of events) {
    const field = EVENT_FIELD_MAP[event.eventType];
    if (!field) {
      continue;
    }

    const key = toDayKey(event.occurredAt);
    const existing = buckets.get(key) ?? createEmptyDailyCounts();

    existing[field] += 1;
    buckets.set(key, existing);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, counts]) => ({
      label: formatDayLabel(key),
      ...counts,
    }));
}

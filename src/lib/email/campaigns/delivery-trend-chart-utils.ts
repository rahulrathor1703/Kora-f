import type {
  CampaignDailyActivityPoint,
  EmailCampaignProgressTimeline,
} from '@/lib/email/campaigns/progress-types';

export interface DeliveryTrendPoint {
  label: string;
  date: string;
  dailySent: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalReplied: number;
  totalBounced: number;
  totalUnsubscribed: number;
}

function toDayKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function addDays(dayKey: string, days: number): string {
  const date = new Date(`${dayKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatAxisDateLabel(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
  });
}

export function formatTooltipDateLabel(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function emptyDailyCounts(): Omit<CampaignDailyActivityPoint, 'date'> {
  return {
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
  };
}

export function buildDeliveryTrendPoints(
  timeline: EmailCampaignProgressTimeline,
  dailyPoints: CampaignDailyActivityPoint[],
): DeliveryTrendPoint[] {
  if (!timeline.launchAt) {
    return buildCumulativePointsFromDaily(dailyPoints);
  }

  const launchKey = toDayKey(timeline.launchAt);
  const todayKey = toDayKey(new Date());
  const estimatedEndKey = timeline.estimatedEndAt
    ? toDayKey(timeline.estimatedEndAt)
    : todayKey;
  const lastActivityKey =
    dailyPoints.length > 0
      ? dailyPoints[dailyPoints.length - 1].date
      : launchKey;
  const rangeEnd = [todayKey, estimatedEndKey, lastActivityKey].sort().at(-1)!;
  const activityByDay = new Map(
    dailyPoints.map((point) => [point.date, point] as const),
  );

  const dailySeries: CampaignDailyActivityPoint[] = [];
  let dayKey = launchKey;

  while (dayKey <= rangeEnd) {
    dailySeries.push(
      activityByDay.get(dayKey) ?? {
        date: dayKey,
        ...emptyDailyCounts(),
      },
    );
    dayKey = addDays(dayKey, 1);
  }

  return buildCumulativePointsFromDaily(dailySeries, timeline.sentCount);
}

function buildCumulativePointsFromDaily(
  dailyPoints: CampaignDailyActivityPoint[],
  totalSentOverride?: number,
): DeliveryTrendPoint[] {
  const sortedDays = [...dailyPoints].sort((left, right) =>
    left.date.localeCompare(right.date),
  );

  let totalSent = 0;
  let totalDelivered = 0;
  let totalOpened = 0;
  let totalClicked = 0;
  let totalReplied = 0;
  let totalBounced = 0;
  let totalUnsubscribed = 0;

  const points = sortedDays.map((day) => {
    totalSent += day.sent;
    totalDelivered += Math.max(0, day.sent - day.bounced);
    totalOpened += day.opened;
    totalClicked += day.clicked;
    totalReplied += day.replied;
    totalBounced += day.bounced;
    totalUnsubscribed += day.unsubscribed;

    return {
      label: formatAxisDateLabel(day.date),
      date: day.date,
      dailySent: day.sent,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalReplied,
      totalBounced,
      totalUnsubscribed,
    };
  });

  if (points.length > 0 && totalSentOverride != null && totalSentOverride > 0) {
    points[points.length - 1].totalSent = totalSentOverride;
  }

  return points;
}

/** Builds cumulative delivery trend points from ordered monthly (or daily) activity buckets. */
export function buildDeliveryTrendPointsFromActivityBuckets(
  dailyPoints: CampaignDailyActivityPoint[],
  totalSentOverride?: number,
): DeliveryTrendPoint[] {
  return buildCumulativePointsFromDaily(dailyPoints, totalSentOverride);
}

export function getDeliveryTrendMaxValue(points: DeliveryTrendPoint[]): number {
  return Math.max(
    ...points.flatMap((point) => [
      point.totalSent,
      point.totalDelivered,
      point.totalOpened,
      point.totalClicked,
      point.totalReplied,
      point.totalBounced,
      point.totalUnsubscribed,
    ]),
    1,
  );
}

export function getDeliveryTrendAxisMax(
  totalContacts: number,
  peakMetric: number,
): number {
  return Math.max(totalContacts, peakMetric, 1);
}

export function getDeliveryTrendAxisTicks(max: number): number[] {
  if (max <= 6) {
    return Array.from({ length: max + 1 }, (_, index) => index);
  }

  if (max <= 20) {
    return Array.from({ length: Math.floor(max / 2) + 1 }, (_, index) => index * 2);
  }

  if (max <= 50) {
    return Array.from({ length: Math.floor(max / 5) + 1 }, (_, index) => index * 5);
  }

  if (max <= 100) {
    return Array.from({ length: Math.floor(max / 10) + 1 }, (_, index) => index * 10);
  }

  const step = Math.max(20, Math.ceil(max / 8 / 20) * 20);
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => index * step);
}

export function getDeliveryTrendXAxisInterval(pointCount: number): number {
  if (pointCount <= 8) {
    return 0;
  }

  if (pointCount <= 16) {
    return 1;
  }

  if (pointCount <= 32) {
    return 2;
  }

  return Math.ceil(pointCount / 12) - 1;
}

import type { CampaignDailyActivityPoint } from '@/lib/email/campaigns/progress-types';
import {
  buildDeliveryTrendPointsFromActivityBuckets,
  type DeliveryTrendPoint,
} from '@/lib/email/campaigns/delivery-trend-chart-utils';
import type { AnalyticsQueryPoint } from '@/lib/email/analytics/types';

function parseMonthLabelToDayKey(label: string): string {
  const parsed = Date.parse(label.replace(/^(\w+)\s+(\d+)$/, '$1 1, $2'));
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

export function formatChartPeriodLabel(label: string): string {
  const dayKey = parseMonthLabelToDayKey(label);
  const date = new Date(`${dayKey}T12:00:00`);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear().toString().slice(-2);
  return `${month} '${year}`;
}

function pointsToMap(points: AnalyticsQueryPoint[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const point of points) {
    map.set(point.label, point.value);
  }

  return map;
}

export interface OrgSendVolumeTrendInput {
  sentPoints: AnalyticsQueryPoint[];
  openedPoints: AnalyticsQueryPoint[];
  clickedPoints: AnalyticsQueryPoint[];
  repliedPoints: AnalyticsQueryPoint[];
  bouncedPoints: AnalyticsQueryPoint[];
}

export function buildOrgSendVolumeTrendPoints(
  input: OrgSendVolumeTrendInput,
): DeliveryTrendPoint[] {
  const sentMap = pointsToMap(input.sentPoints);
  const openedMap = pointsToMap(input.openedPoints);
  const clickedMap = pointsToMap(input.clickedPoints);
  const repliedMap = pointsToMap(input.repliedPoints);
  const bouncedMap = pointsToMap(input.bouncedPoints);

  const monthLabels = input.sentPoints.map((point) => point.label);

  if (monthLabels.length === 0) {
    return [];
  }

  const activityBuckets: CampaignDailyActivityPoint[] = monthLabels.map((label) => ({
    date: parseMonthLabelToDayKey(label),
    sent: sentMap.get(label) ?? 0,
    opened: openedMap.get(label) ?? 0,
    clicked: clickedMap.get(label) ?? 0,
    replied: repliedMap.get(label) ?? 0,
    bounced: bouncedMap.get(label) ?? 0,
    unsubscribed: 0,
  }));

  const trendPoints = buildDeliveryTrendPointsFromActivityBuckets(activityBuckets);

  return trendPoints.map((point, index) => ({
    ...point,
    label: formatChartPeriodLabel(monthLabels[index] ?? point.date),
  }));
}

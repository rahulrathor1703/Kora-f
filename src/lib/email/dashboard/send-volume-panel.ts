import { formatMetricValue } from '@/lib/email/analytics/types';
import type { AnalyticsQueryPoint } from '@/lib/email/analytics/types';
export interface SendVolumeSideMetricRow {
  label: string;
  value: string;
  deltaLabel: string | null;
}

export interface SendVolumePanelView {
  sideMetrics: SendVolumeSideMetricRow[];
}

export function formatDashboardCompactCount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercentDelta(current: number, previous: number): string | null {
  if (previous <= 0) {
    return null;
  }

  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

function formatPpDelta(currentRate: number, previousRate: number): string | null {
  const change = currentRate - previousRate;
  if (!Number.isFinite(change)) {
    return null;
  }

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}pp`;
}

function monthlyRate(
  numerator: number,
  denominator: number,
): number | null {
  if (denominator <= 0) {
    return null;
  }

  return (numerator / denominator) * 100;
}

function getLastTwoMonthlyBuckets(
  sentPoints: AnalyticsQueryPoint[],
  getValue: (label: string) => number,
): { current: number; previous: number } | null {
  if (sentPoints.length < 2) {
    return null;
  }

  const lastLabel = sentPoints[sentPoints.length - 1]?.label;
  const priorLabel = sentPoints[sentPoints.length - 2]?.label;
  if (!lastLabel || !priorLabel) {
    return null;
  }

  return {
    current: getValue(lastLabel),
    previous: getValue(priorLabel),
  };
}

function pointsToMap(points: AnalyticsQueryPoint[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const point of points) {
    map.set(point.label, point.value);
  }
  return map;
}

export interface BuildSendVolumeSideMetricsInput {
  totalSent: number;
  deliverability: number;
  openRate: number;
  ctr: number;
  sentPoints: AnalyticsQueryPoint[];
  openedPoints: AnalyticsQueryPoint[];
  clickedPoints: AnalyticsQueryPoint[];
  bouncedPoints: AnalyticsQueryPoint[];
}

export function buildSendVolumeSideMetrics(
  input: BuildSendVolumeSideMetricsInput,
): SendVolumeSideMetricRow[] {
  const openedMap = pointsToMap(input.openedPoints);
  const clickedMap = pointsToMap(input.clickedPoints);
  const bouncedMap = pointsToMap(input.bouncedPoints);
  const sentMap = pointsToMap(input.sentPoints);

  const sentMom = getLastTwoMonthlyBuckets(input.sentPoints, (label) =>
    sentMap.get(label) ?? 0,
  );

  const lastTwoLabels =
    input.sentPoints.length >= 2
      ? {
          current: input.sentPoints[input.sentPoints.length - 1]?.label ?? '',
          previous: input.sentPoints[input.sentPoints.length - 2]?.label ?? '',
        }
      : null;

  let deliverabilityDelta: string | null = null;
  let openRateDelta: string | null = null;
  let ctrDelta: string | null = null;

  if (lastTwoLabels?.current && lastTwoLabels.previous) {
    const currentSent = sentMap.get(lastTwoLabels.current) ?? 0;
    const previousSent = sentMap.get(lastTwoLabels.previous) ?? 0;
    const currentBounced = bouncedMap.get(lastTwoLabels.current) ?? 0;
    const previousBounced = bouncedMap.get(lastTwoLabels.previous) ?? 0;

    const currentDeliverability = monthlyRate(
      currentSent - currentBounced,
      currentSent,
    );
    const previousDeliverability = monthlyRate(
      previousSent - previousBounced,
      previousSent,
    );

    if (currentDeliverability != null && previousDeliverability != null) {
      deliverabilityDelta = formatPpDelta(
        currentDeliverability,
        previousDeliverability,
      );
    }

    const currentOpen = monthlyRate(
      openedMap.get(lastTwoLabels.current) ?? 0,
      currentSent,
    );
    const previousOpen = monthlyRate(
      openedMap.get(lastTwoLabels.previous) ?? 0,
      previousSent,
    );
    if (currentOpen != null && previousOpen != null) {
      openRateDelta = formatPpDelta(currentOpen, previousOpen);
    }

    const currentCtr = monthlyRate(
      clickedMap.get(lastTwoLabels.current) ?? 0,
      currentSent,
    );
    const previousCtr = monthlyRate(
      clickedMap.get(lastTwoLabels.previous) ?? 0,
      previousSent,
    );
    if (currentCtr != null && previousCtr != null) {
      ctrDelta = formatPpDelta(currentCtr, previousCtr);
    }
  }

  const totalSentDelta =
    sentMom != null ? formatPercentDelta(sentMom.current, sentMom.previous) : null;

  return [
    {
      label: 'Total sent',
      value: formatDashboardCompactCount(input.totalSent),
      deltaLabel: totalSentDelta,
    },
    {
      label: 'Deliverability',
      value: formatMetricValue(input.deliverability, 'percent'),
      deltaLabel: deliverabilityDelta,
    },
    {
      label: 'Open rate',
      value: formatMetricValue(input.openRate, 'percent'),
      deltaLabel: openRateDelta,
    },
    {
      label: 'CTR',
      value: formatMetricValue(input.ctr, 'percent'),
      deltaLabel: ctrDelta,
    },
  ];
}

export function buildSendVolumePanelView(
  input: BuildSendVolumeSideMetricsInput,
): SendVolumePanelView {
  return {
    sideMetrics: buildSendVolumeSideMetrics(input),
  };
}

export type AnalyticsDashboardVisibility = 'private' | 'org';

export type AnalyticsMetric =
  | 'total_sent'
  | 'total_opened'
  | 'open_rate'
  | 'total_replied'
  | 'reply_rate'
  | 'total_clicks'
  | 'ctr'
  | 'total_bounced'
  | 'bounce_rate'
  | 'follow_ups_sent'
  | 'deliverability';

export type AnalyticsGroupBy =
  | 'campaign'
  | 'brand'
  | 'region'
  | 'sender'
  | 'type'
  | 'month'
  | 'status';

export type AnalyticsChartType =
  | 'bar'
  | 'line'
  | 'donut'
  | 'stat_card'
  | 'table';

export interface AnalyticsFilters {
  brandId?: string | null;
  regionId?: string | null;
  campaignTypeId?: string | null;
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface AnalyticsWidget {
  id: string;
  dashboardId: string;
  name: string;
  metric: AnalyticsMetric;
  groupBy: AnalyticsGroupBy;
  chartType: AnalyticsChartType;
  filters: AnalyticsFilters;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsDashboard {
  id: string;
  organizationId: string;
  createdByUserId: string;
  name: string;
  visibility: AnalyticsDashboardVisibility;
  globalFilters: AnalyticsFilters;
  sortOrder: number;
  widgets: AnalyticsWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsQueryPoint {
  label: string;
  value: number;
}

export interface AnalyticsQueryResult {
  points: AnalyticsQueryPoint[];
  total?: number;
  format: 'count' | 'percent';
}

export interface AnalyticsFilterOptions {
  brands: { id: string; label: string }[];
  regions: { id: string; label: string }[];
  types: { id: string; label: string }[];
  statuses: { value: string; label: string }[];
}

export interface CreateAnalyticsDashboardInput {
  name: string;
  visibility: AnalyticsDashboardVisibility;
  globalFilters?: AnalyticsFilters;
}

export interface UpdateAnalyticsDashboardInput {
  name?: string;
  visibility?: AnalyticsDashboardVisibility;
  globalFilters?: AnalyticsFilters;
}

export interface CreateAnalyticsWidgetInput {
  name: string;
  metric: AnalyticsMetric;
  groupBy: AnalyticsGroupBy;
  chartType: AnalyticsChartType;
  filters?: AnalyticsFilters;
}

export interface UpdateAnalyticsWidgetInput {
  name?: string;
  metric?: AnalyticsMetric;
  groupBy?: AnalyticsGroupBy;
  chartType?: AnalyticsChartType;
  filters?: AnalyticsFilters;
}

export interface AnalyticsQueryInput {
  metric: AnalyticsMetric;
  groupBy: AnalyticsGroupBy;
  filters?: AnalyticsFilters;
  globalFilters?: AnalyticsFilters;
}

export const MAX_WIDGETS_PER_DASHBOARD = 12;

export const METRIC_OPTIONS: {
  value: AnalyticsMetric;
  label: string;
  color: string;
}[] = [
  { value: 'total_sent', label: 'Total Sent', color: '#3B82F6' },
  { value: 'total_opened', label: 'Total Opened', color: '#F97316' },
  { value: 'open_rate', label: 'Open Rate', color: '#F59E0B' },
  { value: 'total_replied', label: 'Total Replied', color: '#22C55E' },
  { value: 'reply_rate', label: 'Reply Rate', color: '#16A34A' },
  { value: 'total_clicks', label: 'Total Clicks', color: '#06B6D4' },
  { value: 'ctr', label: 'CTR', color: '#0891B2' },
  { value: 'total_bounced', label: 'Total Bounced', color: '#EF4444' },
  { value: 'bounce_rate', label: 'Bounce Rate', color: '#DC2626' },
  { value: 'follow_ups_sent', label: 'Follow-ups Sent', color: '#94A3B8' },
  { value: 'deliverability', label: 'Deliverability', color: '#10B981' },
];

export const GROUP_BY_OPTIONS: { value: AnalyticsGroupBy; label: string }[] = [
  { value: 'campaign', label: 'Per Campaign' },
  { value: 'brand', label: 'Per Brand' },
  { value: 'region', label: 'Per Region' },
  { value: 'sender', label: 'Per Sender' },
  { value: 'type', label: 'Per Type' },
  { value: 'month', label: 'Per Month' },
  { value: 'status', label: 'Per Status' },
];

export const CHART_TYPE_OPTIONS: {
  value: AnalyticsChartType;
  label: string;
}[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'donut', label: 'Donut' },
  { value: 'stat_card', label: 'Stat Card' },
  { value: 'table', label: 'Table' },
];

export function getMetricLabel(metric: AnalyticsMetric): string {
  return METRIC_OPTIONS.find((option) => option.value === metric)?.label ?? metric;
}

export function getGroupByLabel(groupBy: AnalyticsGroupBy): string {
  return (
    GROUP_BY_OPTIONS.find((option) => option.value === groupBy)?.label ?? groupBy
  );
}

export function getChartTypeLabel(chartType: AnalyticsChartType): string {
  return (
    CHART_TYPE_OPTIONS.find((option) => option.value === chartType)?.label ??
    chartType
  );
}

export function buildDefaultWidgetName(
  metric: AnalyticsMetric,
  groupBy: AnalyticsGroupBy,
): string {
  return `${getMetricLabel(metric)} by ${getGroupByLabel(groupBy)}`;
}

export function suggestChartType(
  metric: AnalyticsMetric,
  groupBy: AnalyticsGroupBy,
): AnalyticsChartType {
  if (groupBy === 'month') {
    return 'line';
  }

  if (metric.includes('rate') || metric === 'ctr' || metric === 'deliverability') {
    return groupBy === 'campaign' ? 'line' : 'bar';
  }

  return 'bar';
}

export function formatMetricValue(
  value: number,
  format: 'count' | 'percent',
): string {
  if (format === 'percent') {
    return `${value}%`;
  }

  return value.toLocaleString();
}

import { z } from 'zod';
import type {
  AnalyticsChartType,
  AnalyticsGroupBy,
  AnalyticsMetric,
} from '@/lib/email/analytics/types';

export const WIDGET_WIZARD_STEPS = [
  { id: 'metric-group', label: 'Metric & Group' },
  { id: 'filters', label: 'Set Filters' },
  { id: 'chart-name', label: 'Chart Type & Name' },
] as const;

export const analyticsFiltersSchema = z.object({
  brandId: z.string().nullable().optional(),
  regionId: z.string().nullable().optional(),
  campaignTypeId: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});

export const widgetWizardSchema = z.object({
  metric: z.enum([
    'total_sent',
    'total_opened',
    'open_rate',
    'total_replied',
    'reply_rate',
    'total_clicks',
    'ctr',
    'total_bounced',
    'bounce_rate',
    'follow_ups_sent',
    'deliverability',
  ] satisfies AnalyticsMetric[]),
  groupBy: z.enum([
    'campaign',
    'brand',
    'region',
    'sender',
    'type',
    'month',
    'status',
  ] satisfies AnalyticsGroupBy[]),
  filters: analyticsFiltersSchema,
  chartType: z.enum([
    'bar',
    'line',
    'donut',
    'stat_card',
    'table',
  ] satisfies AnalyticsChartType[]),
  name: z.string().trim().min(1, 'Widget name is required').max(160),
});

export type WidgetWizardFormValues = z.infer<typeof widgetWizardSchema>;

export const WIDGET_WIZARD_DEFAULT_VALUES: WidgetWizardFormValues = {
  metric: 'open_rate',
  groupBy: 'campaign',
  filters: {
    brandId: null,
    regionId: null,
    campaignTypeId: null,
    status: null,
  },
  chartType: 'bar',
  name: 'Open Rate by Per Campaign',
};

export const widgetWizardStep1Schema = widgetWizardSchema.pick({
  metric: true,
  groupBy: true,
});

export const widgetWizardStep3Schema = widgetWizardSchema.pick({
  chartType: true,
  name: true,
});

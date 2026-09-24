import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  AnalyticsDashboard,
  AnalyticsFilterOptions,
  AnalyticsQueryInput,
  AnalyticsQueryResult,
  AnalyticsWidget,
  CreateAnalyticsDashboardInput,
  CreateAnalyticsWidgetInput,
  UpdateAnalyticsDashboardInput,
  UpdateAnalyticsWidgetInput,
  AnalyticsFilters,
} from '@/lib/email/analytics/types';
import { buildFilterQuery } from '@/lib/email/analytics/filter-query';

export const analyticsService = {
  getDashboards() {
    return apiClient.get<AnalyticsDashboard[]>(ENDPOINTS.analytics.dashboards);
  },

  createDashboard(input: CreateAnalyticsDashboardInput) {
    return apiClient.post<AnalyticsDashboard>(
      ENDPOINTS.analytics.dashboards,
      input,
    );
  },

  updateDashboard(id: string, input: UpdateAnalyticsDashboardInput) {
    return apiClient.patch<AnalyticsDashboard>(
      ENDPOINTS.analytics.dashboard(id),
      input,
    );
  },

  deleteDashboard(id: string) {
    return apiClient.delete<void>(ENDPOINTS.analytics.dashboard(id));
  },

  addWidget(dashboardId: string, input: CreateAnalyticsWidgetInput) {
    return apiClient.post<AnalyticsWidget>(
      ENDPOINTS.analytics.widgets(dashboardId),
      input,
    );
  },

  updateWidget(
    dashboardId: string,
    widgetId: string,
    input: UpdateAnalyticsWidgetInput,
  ) {
    return apiClient.patch<AnalyticsWidget>(
      ENDPOINTS.analytics.widget(dashboardId, widgetId),
      input,
    );
  },

  deleteWidget(dashboardId: string, widgetId: string) {
    return apiClient.delete<void>(
      ENDPOINTS.analytics.widget(dashboardId, widgetId),
    );
  },

  query(input: AnalyticsQueryInput) {
    return apiClient.post<AnalyticsQueryResult>(ENDPOINTS.analytics.query, input);
  },

  getFilterOptions() {
    return apiClient.get<AnalyticsFilterOptions>(
      ENDPOINTS.analytics.filterOptions,
    );
  },

  getCampaignCount(filters: AnalyticsFilters = {}) {
    return apiClient.get<{ count: number }>(
      `${ENDPOINTS.analytics.campaignCount}${buildFilterQuery(filters)}`,
    );
  },
};

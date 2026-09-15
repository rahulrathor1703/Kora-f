'use client';

import { useCallback, useMemo, useState } from 'react';
import { analyticsService } from '@/lib/api/services/analytics.service';
import type {
  AnalyticsDashboard,
  AnalyticsFilterOptions,
  AnalyticsFilters,
  CreateAnalyticsDashboardInput,
  CreateAnalyticsWidgetInput,
  UpdateAnalyticsDashboardInput,
  UpdateAnalyticsWidgetInput,
} from '@/lib/email/analytics/types';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useAnalyticsDashboards() {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery('analytics.dashboards', () => analyticsService.getDashboards());

  const dashboards = useMemo(() => data ?? [], [data]);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);

  const activeDashboard = useMemo(() => {
    if (dashboards.length === 0) {
      return null;
    }

    const selected = dashboards.find((dashboard) => dashboard.id === activeDashboardId);
    return selected ?? dashboards[0] ?? null;
  }, [activeDashboardId, dashboards]);

  const { mutate: createDashboardMutate, isLoading: isCreatingDashboard } =
    useApiMutation((input: CreateAnalyticsDashboardInput) =>
      analyticsService.createDashboard(input),
    );

  const { mutate: updateDashboardMutate, isLoading: isUpdatingDashboard } =
    useApiMutation(
      ({
        id,
        input,
      }: {
        id: string;
        input: UpdateAnalyticsDashboardInput;
      }) => analyticsService.updateDashboard(id, input),
    );

  const { mutate: deleteDashboardMutate, isLoading: isDeletingDashboard } =
    useApiMutation((id: string) => analyticsService.deleteDashboard(id));

  const { mutate: addWidgetMutate, isLoading: isAddingWidget } = useApiMutation(
    ({
      dashboardId,
      input,
    }: {
      dashboardId: string;
      input: CreateAnalyticsWidgetInput;
    }) => analyticsService.addWidget(dashboardId, input),
  );

  const { mutate: updateWidgetMutate, isLoading: isUpdatingWidget } =
    useApiMutation(
      ({
        dashboardId,
        widgetId,
        input,
      }: {
        dashboardId: string;
        widgetId: string;
        input: UpdateAnalyticsWidgetInput;
      }) => analyticsService.updateWidget(dashboardId, widgetId, input),
    );

  const { mutate: deleteWidgetMutate, isLoading: isDeletingWidget } =
    useApiMutation(
      ({
        dashboardId,
        widgetId,
      }: {
        dashboardId: string;
        widgetId: string;
      }) => analyticsService.deleteWidget(dashboardId, widgetId),
    );

  const refresh = useCallback(async () => {
    const next = await refetch();
    if (next && next.length > 0) {
      setActiveDashboardId((current) =>
        current && next.some((dashboard) => dashboard.id === current)
          ? current
          : next[0].id,
      );
    } else {
      setActiveDashboardId(null);
    }
    return next;
  }, [refetch]);

  const createDashboard = useCallback(
    async (input: CreateAnalyticsDashboardInput) => {
      const created = await createDashboardMutate(input);
      const next = await refresh();
      setActiveDashboardId(created.id);
      return next?.find((dashboard) => dashboard.id === created.id) ?? created;
    },
    [createDashboardMutate, refresh],
  );

  const updateDashboard = useCallback(
    async (id: string, input: UpdateAnalyticsDashboardInput) => {
      await updateDashboardMutate({ id, input });
      return refresh();
    },
    [refresh, updateDashboardMutate],
  );

  const deleteDashboard = useCallback(
    async (id: string) => {
      await deleteDashboardMutate(id);
      return refresh();
    },
    [deleteDashboardMutate, refresh],
  );

  const addWidget = useCallback(
    async (dashboardId: string, input: CreateAnalyticsWidgetInput) => {
      await addWidgetMutate({ dashboardId, input });
      return refresh();
    },
    [addWidgetMutate, refresh],
  );

  const updateWidget = useCallback(
    async (
      dashboardId: string,
      widgetId: string,
      input: UpdateAnalyticsWidgetInput,
    ) => {
      await updateWidgetMutate({ dashboardId, widgetId, input });
      return refresh();
    },
    [refresh, updateWidgetMutate],
  );

  const deleteWidget = useCallback(
    async (dashboardId: string, widgetId: string) => {
      await deleteWidgetMutate({ dashboardId, widgetId });
      return refresh();
    },
    [deleteWidgetMutate, refresh],
  );

  return {
    dashboards,
    activeDashboard,
    activeDashboardId: activeDashboard?.id ?? null,
    setActiveDashboardId,
    isLoading,
    error,
    refresh,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    updateWidget,
    deleteWidget,
    isCreatingDashboard,
    isUpdatingDashboard,
    isDeletingDashboard,
    isAddingWidget,
    isUpdatingWidget,
    isDeletingWidget,
  };
}

export function useAnalyticsFilterOptions() {
  return useApiQuery('analytics.filter-options', () =>
    analyticsService.getFilterOptions(),
  );
}

export function useAnalyticsCampaignCount(filters: AnalyticsFilters) {
  const queryKey = [
    'analytics.campaign-count',
    filters.brandId ?? '',
    filters.regionId ?? '',
    filters.campaignTypeId ?? '',
    filters.status ?? '',
  ].join('.');

  return useApiQuery(
    queryKey,
    () => analyticsService.getCampaignCount(filters),
    { refetchIntervalMs: 30_000 },
  );
}

export function useAnalyticsWidgetData(
  metric: AnalyticsDashboard['widgets'][number]['metric'] | null,
  groupBy: AnalyticsDashboard['widgets'][number]['groupBy'] | null,
  widgetFilters: AnalyticsFilters,
  globalFilters: AnalyticsFilters,
  enabled: boolean,
) {
  const queryKey = [
    'analytics.query',
    metric ?? 'none',
    groupBy ?? 'none',
    JSON.stringify(widgetFilters),
    JSON.stringify(globalFilters),
  ].join('.');

  return useApiQuery(
    queryKey,
    () =>
      analyticsService.query({
        metric: metric!,
        groupBy: groupBy!,
        filters: widgetFilters,
        globalFilters,
      }),
    { enabled: enabled && Boolean(metric && groupBy), refetchIntervalMs: 30_000 },
  );
}

export type { AnalyticsFilterOptions };

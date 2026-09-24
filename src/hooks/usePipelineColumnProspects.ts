'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { prospectsService } from '@/lib/api/services/prospects.service';
import { PIPELINE_COLUMN_PAGE_SIZE } from '@/lib/crm/pipeline/constants';
import type { FollowUpRange } from '@/lib/crm/followups/types';
import type { Prospect } from '@/lib/crm/prospects/types';

interface UsePipelineColumnProspectsOptions {
  stageValue: string;
  stageFieldKey: string;
  search: string;
  filters: Record<string, string>;
  followUpRange?: FollowUpRange;
  refreshToken: number;
  excludedProspectIds?: ReadonlySet<string>;
}

interface UsePipelineColumnProspectsResult {
  items: Prospect[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<unknown>;
}

export function usePipelineColumnProspects({
  stageValue,
  stageFieldKey,
  search,
  filters,
  followUpRange,
  refreshToken,
  excludedProspectIds,
}: UsePipelineColumnProspectsOptions): UsePipelineColumnProspectsResult {
  const [extraItems, setExtraItems] = useState<Prospect[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const orgScopeKey = useOrgScopeKey();

  const activeFilters = useMemo(
    () => ({
      ...filters,
      ...(stageFieldKey ? { [stageFieldKey]: stageValue } : {}),
    }),
    [filters, stageFieldKey, stageValue],
  );

  const queryKey = [
    'prospects.pipeline-column',
    orgScopeKey,
    stageValue,
    search,
    JSON.stringify(activeFilters),
    followUpRange ?? '',
  ].join('.');

  const { data, isLoading, isFetching, refetch } = useApiQuery(
    queryKey,
    () =>
      prospectsService.getProspects({
        q: search,
        page: 1,
        pageSize: PIPELINE_COLUMN_PAGE_SIZE,
        filters: activeFilters,
        followUpRange,
      }),
    { enabled: true },
  );

  const scopedExtraItems = useMemo(
    () => (isFetching ? [] : extraItems),
    [extraItems, isFetching],
  );

  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    if (refreshTokenRef.current === refreshToken) {
      return;
    }

    refreshTokenRef.current = refreshToken;
    void refetch();
  }, [refreshToken, refetch]);

  const firstPageItems = useMemo(
    () => data?.items ?? [],
    [data?.items],
  );
  const total = data?.total ?? 0;

  const baseItems = useMemo(() => {
    const seen = new Set(firstPageItems.map((item) => item.id));
    const appended = scopedExtraItems.filter((item) => !seen.has(item.id));
    return [...firstPageItems, ...appended];
  }, [firstPageItems, scopedExtraItems]);

  const visibleItems = useMemo(() => {
    if (!excludedProspectIds?.size) {
      return baseItems;
    }

    return baseItems.filter((item) => !excludedProspectIds.has(item.id));
  }, [baseItems, excludedProspectIds]);

  const hasMore = baseItems.length < total;

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    const nextPage = Math.floor(baseItems.length / PIPELINE_COLUMN_PAGE_SIZE) + 1;
    setIsLoadingMore(true);

    void prospectsService
      .getProspects({
        q: search,
        page: nextPage,
        pageSize: PIPELINE_COLUMN_PAGE_SIZE,
        filters: activeFilters,
        followUpRange,
      })
      .then((result) => {
        setExtraItems((current) => {
          const seen = new Set([
            ...firstPageItems.map((item) => item.id),
            ...current.map((item) => item.id),
          ]);
          const appended = result.items.filter((item) => !seen.has(item.id));
          return [...current, ...appended];
        });
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [
    activeFilters,
    baseItems.length,
    firstPageItems,
    followUpRange,
    hasMore,
    isLoading,
    isLoadingMore,
    search,
  ]);

  const scopedRefetch = useCallback(async () => refetch(), [refetch]);

  return {
    items: visibleItems,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refetch: scopedRefetch,
  };
}

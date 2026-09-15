'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  fetchQuery,
  getQuerySnapshot,
  subscribeQuery,
  type QuerySnapshot,
} from './query-cache';

interface UseApiQueryOptions {
  enabled?: boolean;
  refetchIntervalMs?: number;
  refetchOnWindowFocus?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<T | null>;
}

const EMPTY_SNAPSHOT: QuerySnapshot<never> = {
  data: null,
  error: null,
  isFetching: false,
  invalidationGeneration: 0,
};

export function useApiQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: UseApiQueryOptions = {},
): UseApiQueryResult<T> {
  const { enabled = true, refetchIntervalMs, refetchOnWindowFocus = false } =
    options;
  const queryFnRef = useRef(queryFn);
  const lastInvalidationGenerationRef = useRef(0);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const subscribe = useCallback(
    (callback: () => void) => subscribeQuery<T>(queryKey, callback),
    [queryKey],
  );

  const getSnapshot = useCallback(
    () => (enabled ? getQuerySnapshot<T>(queryKey) : EMPTY_SNAPSHOT),
    [enabled, queryKey],
  );

  const snapshot = useSyncExternalStore(
    enabled ? subscribe : () => () => {},
    getSnapshot,
    getSnapshot,
  );

  const refetch = useCallback(async (): Promise<T | null> => {
    return fetchQuery(queryKey, () => queryFnRef.current(), { force: true });
  }, [queryKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchQuery(queryKey, () => queryFnRef.current());
  }, [enabled, queryKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (
      snapshot.invalidationGeneration > lastInvalidationGenerationRef.current
    ) {
      lastInvalidationGenerationRef.current = snapshot.invalidationGeneration;
      void refetch();
    }
  }, [enabled, refetch, snapshot.invalidationGeneration]);

  useEffect(() => {
    if (!enabled || !refetchIntervalMs || refetchIntervalMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetch();
    }, refetchIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, refetchIntervalMs, refetch]);

  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) {
      return;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void refetch();
      }
    }

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, refetch, refetchOnWindowFocus]);

  const resolvedFetching = enabled ? snapshot.isFetching : false;

  return {
    data: snapshot.data as T | null,
    error: snapshot.error,
    isLoading: resolvedFetching && snapshot.data === null,
    isFetching: resolvedFetching,
    refetch,
  };
}

import { getApiErrorMessage } from '@/lib/api';

export interface QuerySnapshot<T> {
  data: T | null;
  error: string | null;
  isFetching: boolean;
  invalidationGeneration: number;
}

interface QueryCacheEntry<T> {
  data: T | null;
  error: string | null;
  isFetching: boolean;
  hasFetched: boolean;
  inFlight: Promise<T | null> | null;
  /** Bumped on setQueryData/invalidate so stale in-flight GETs cannot overwrite fresh writes. */
  fetchEpoch: number;
  invalidationGeneration: number;
  snapshot: QuerySnapshot<T>;
  subscribers: Set<() => void>;
}

const queryCache = new Map<string, QueryCacheEntry<unknown>>();

function createSnapshot<T>(
  data: T | null,
  error: string | null,
  isFetching: boolean,
  invalidationGeneration: number,
): QuerySnapshot<T> {
  return { data, error, isFetching, invalidationGeneration };
}

function getEntry<T>(queryKey: string): QueryCacheEntry<T> {
  const existing = queryCache.get(queryKey);

  if (existing) {
    return existing as QueryCacheEntry<T>;
  }

  const entry: QueryCacheEntry<T> = {
    data: null,
    error: null,
    isFetching: false,
    hasFetched: false,
    inFlight: null,
    fetchEpoch: 0,
    invalidationGeneration: 0,
    snapshot: createSnapshot<T>(null, null, false, 0),
    subscribers: new Set(),
  };

  queryCache.set(queryKey, entry);
  return entry;
}

function publish<T>(entry: QueryCacheEntry<T>): void {
  entry.snapshot = createSnapshot(
    entry.data,
    entry.error,
    entry.isFetching,
    entry.invalidationGeneration,
  );
  entry.subscribers.forEach((callback) => callback());
}

export function subscribeQuery<T>(
  queryKey: string,
  callback: () => void,
): () => void {
  const entry = getEntry<T>(queryKey);
  entry.subscribers.add(callback);

  return () => {
    entry.subscribers.delete(callback);
  };
}

export function getQuerySnapshot<T>(queryKey: string): QuerySnapshot<T> {
  return getEntry<T>(queryKey).snapshot;
}

export function setQueryData<T>(queryKey: string, data: T): void {
  const entry = getEntry<T>(queryKey);
  entry.fetchEpoch += 1;
  entry.data = data;
  entry.error = null;
  entry.hasFetched = true;
  entry.isFetching = false;
  entry.inFlight = null;
  publish(entry);
}

export function invalidateQuery(queryKey: string): void {
  const entry = queryCache.get(queryKey);

  if (!entry) {
    return;
  }

  entry.fetchEpoch += 1;
  entry.data = null;
  entry.error = null;
  entry.isFetching = false;
  entry.hasFetched = false;
  entry.inFlight = null;
  entry.invalidationGeneration += 1;
  publish(entry);
}

export function invalidateQueriesByPrefix(prefix: string): void {
  for (const queryKey of queryCache.keys()) {
    if (queryKey.startsWith(prefix)) {
      invalidateQuery(queryKey);
    }
  }
}

export async function fetchQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: { force?: boolean } = {},
): Promise<T | null> {
  const entry = getEntry<T>(queryKey);
  const { force = false } = options;

  if (!force && entry.hasFetched && entry.error === null) {
    return entry.data;
  }

  if (!force && entry.inFlight) {
    return entry.inFlight;
  }

  const fetchEpochAtStart = entry.fetchEpoch;
  entry.isFetching = true;
  publish(entry);

  const inFlightPromise = (async (): Promise<T | null> => {
    try {
      const result = await queryFn();
      if (entry.fetchEpoch === fetchEpochAtStart) {
        entry.data = result;
        entry.error = null;
      }
      return result;
    } catch (err) {
      if (entry.fetchEpoch === fetchEpochAtStart) {
        entry.error = getApiErrorMessage(err, 'Request failed');
        entry.data = null;
      }
      return null;
    } finally {
      if (entry.fetchEpoch === fetchEpochAtStart) {
        entry.hasFetched = true;
        entry.inFlight = null;
        entry.isFetching = false;
        publish(entry);
      }
    }
  })();

  entry.inFlight = inFlightPromise;
  return inFlightPromise;
}

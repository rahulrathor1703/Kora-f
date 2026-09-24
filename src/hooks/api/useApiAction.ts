'use client';

import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api';

interface UseApiActionResult<TOutput> {
  execute: () => Promise<TOutput>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useApiAction<TOutput>(
  actionFn: () => Promise<TOutput>,
): UseApiActionResult<TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async (): Promise<TOutput> => {
    setIsLoading(true);
    setError(null);

    try {
      return await actionFn();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Request failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [actionFn]);

  return { execute, isLoading, error, reset };
}

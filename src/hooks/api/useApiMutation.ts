'use client';

import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api';

interface UseApiMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
): UseApiMutationResult<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput> => {
      setIsLoading(true);
      setError(null);

      try {
        return await mutationFn(input);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Request failed'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn],
  );

  return { mutate, isLoading, error, reset };
}

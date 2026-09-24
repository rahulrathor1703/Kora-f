'use client';

import { useCallback } from 'react';
import { emailConfigService } from '@/lib/api';
import type {
  CreateEmailConfigOptionInput,
  EmailConfigCategory,
  UpdateEmailConfigOptionInput,
} from '@/lib/api';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useEmailConfigOptions(category?: EmailConfigCategory) {
  const queryKey = category
    ? `emailConfig.options.${category}`
    : 'emailConfig.options.all';

  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () => emailConfigService.getAll(category));

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(emailConfigService.create);

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateEmailConfigOptionInput }) =>
      emailConfigService.update(id, input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation(emailConfigService.delete);

  const createOption = useCallback(
    async (input: CreateEmailConfigOptionInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updateOption = useCallback(
    async (id: string, input: UpdateEmailConfigOptionInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [updateMutate, refetch],
  );

  const deleteOption = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    options: data ?? [],
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error: fetchError ?? createError ?? updateError ?? deleteError,
    createOption,
    updateOption,
    deleteOption,
    refetch,
  };
}

export function useEmailConfigOption(id: string | null) {
  return useApiQuery(
    `emailConfig.option.${id ?? 'none'}`,
    () => emailConfigService.getById(id!),
    { enabled: Boolean(id) },
  );
}

'use client';

import { useCallback } from 'react';
import { companyConfigService } from '@/lib/api/services/company-config.service';
import type {
  CreateCompanyConfigOptionInput,
  CompanyConfigCategory,
  UpdateCompanyConfigOptionInput,
} from '@/lib/crm/companies/types';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useCompanyConfigOptions(category?: CompanyConfigCategory) {
  const queryKey = category
    ? `companyConfig.options.${category}`
    : 'companyConfig.options.all';

  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () => companyConfigService.getAll(category));

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(companyConfigService.create);

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateCompanyConfigOptionInput }) =>
      companyConfigService.update(id, input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation(companyConfigService.delete);

  const createOption = useCallback(
    async (input: CreateCompanyConfigOptionInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updateOption = useCallback(
    async (id: string, input: UpdateCompanyConfigOptionInput) => {
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

export function useCompanyConfigOption(id: string | null) {
  return useApiQuery(
    `companyConfig.option.${id ?? 'none'}`,
    () => companyConfigService.getById(id!),
    { enabled: Boolean(id) },
  );
}

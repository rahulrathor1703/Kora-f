'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { onPageSeoService } from '@/lib/api/services/on-page-seo.service';
import type {
  CreateWebsitePropertyInput,
  UpdateWebsitePropertyInput,
} from '@/lib/website/on-page-seo/types';

export function useWebsiteProperties() {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery('website.properties', () => onPageSeoService.getProperties());

  const { mutate: createMutate, isLoading: isCreating } = useApiMutation(
    (input: CreateWebsitePropertyInput) => onPageSeoService.createProperty(input),
  );

  const { mutate: updateMutate, isLoading: isUpdating } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateWebsitePropertyInput }) =>
      onPageSeoService.updateProperty(id, input),
  );

  const { mutate: deleteMutate, isLoading: isDeleting } = useApiMutation(
    (id: string) => onPageSeoService.deleteProperty(id),
  );

  const createProperty = useCallback(
    async (input: CreateWebsitePropertyInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updateProperty = useCallback(
    async (id: string, input: UpdateWebsitePropertyInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [refetch, updateMutate],
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    properties: data ?? [],
    activeProperties: (data ?? []).filter((property) => property.isActive),
    isLoading,
    error: error ? String(error) : null,
    refetch,
    createProperty,
    updateProperty,
    deleteProperty,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

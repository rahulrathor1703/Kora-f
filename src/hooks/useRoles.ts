'use client';

import { useCallback } from 'react';
import { roleService } from '@/lib/api';
import type { CreateRoleInput, UpdateRoleInput } from '@/lib/api';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useRoles() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('roles.list', () => roleService.getAll());

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(roleService.create);

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      roleService.update(id, input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation(roleService.delete);

  const createRole = useCallback(
    async (input: CreateRoleInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updateRole = useCallback(
    async (id: string, input: UpdateRoleInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [updateMutate, refetch],
  );

  const deleteRole = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    roles: data ?? [],
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error: fetchError ?? createError ?? updateError ?? deleteError,
    createRole,
    updateRole,
    deleteRole,
    refetch,
  };
}

export function useRole(id: string | null) {
  return useApiQuery(
    `roles.detail.${id ?? 'none'}`,
    () => roleService.getById(id!),
    { enabled: Boolean(id) },
  );
}

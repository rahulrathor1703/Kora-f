'use client';

import { useCallback } from 'react';
import { abacPolicyService } from '@/lib/api';
import type {
  AssignUserPoliciesInput,
  BulkAssignAbacPoliciesInput,
  CreateAbacPolicyInput,
  UpdateAbacPolicyInput,
} from '@/lib/api';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useAbacPolicies() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('abacPolicies.list', () => abacPolicyService.getAll());

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(abacPolicyService.create);

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateAbacPolicyInput }) =>
      abacPolicyService.update(id, input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation(abacPolicyService.delete);

  const createPolicy = useCallback(
    async (input: CreateAbacPolicyInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updatePolicy = useCallback(
    async (id: string, input: UpdateAbacPolicyInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [updateMutate, refetch],
  );

  const deletePolicy = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    policies: data ?? [],
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error: fetchError ?? createError ?? updateError ?? deleteError,
    createPolicy,
    updatePolicy,
    deletePolicy,
    refetch,
  };
}

export function useAbacPolicy(id: string | null) {
  return useApiQuery(
    `abacPolicies.detail.${id ?? 'none'}`,
    () => abacPolicyService.getById(id!),
    { enabled: Boolean(id) },
  );
}

export function useUserAbacPolicies(userId: string | null) {
  return useApiQuery(
    `abacPolicies.user.${userId ?? 'none'}`,
    () => abacPolicyService.getForUser(userId!),
    { enabled: Boolean(userId) },
  );
}

export function useAssignUserAbacPolicies() {
  const { mutate, isLoading, error } = useApiMutation(
    ({ userId, input }: { userId: string; input: AssignUserPoliciesInput }) =>
      abacPolicyService.assignToUser(userId, input),
  );

  const assignPolicies = useCallback(
    async (userId: string, input: AssignUserPoliciesInput) => {
      return mutate({ userId, input });
    },
    [mutate],
  );

  return { assignPolicies, isAssigning: isLoading, error };
}

export function useBulkAssignAbacPolicies() {
  const { mutate, isLoading, error, reset } = useApiMutation(
    abacPolicyService.bulkAssign,
  );

  const bulkAssign = useCallback(
    async (input: BulkAssignAbacPoliciesInput) => mutate(input),
    [mutate],
  );

  return { bulkAssign, isAssigning: isLoading, error, reset };
}

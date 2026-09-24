'use client';

import { useCallback } from 'react';
import { userService } from '@/lib/api';
import type { UpdateTeamMemberInput, UpdateTeamMemberStatusInput } from '@/lib/api';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useTeamMembers() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('users.list', () => userService.getAll());

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateTeamMemberInput }) =>
      userService.update(id, input),
  );

  const {
    mutate: statusMutate,
    isLoading: isUpdatingStatus,
    error: statusError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateTeamMemberStatusInput }) =>
      userService.updateStatus(id, input),
  );

  const updateMember = useCallback(
    async (id: string, input: UpdateTeamMemberInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [updateMutate, refetch],
  );

  const updateMemberStatus = useCallback(
    async (id: string, input: UpdateTeamMemberStatusInput) => {
      const result = await statusMutate({ id, input });
      await refetch();
      return result;
    },
    [statusMutate, refetch],
  );

  return {
    members: data ?? [],
    isLoading,
    isUpdating,
    isUpdatingStatus,
    error: fetchError ?? updateError ?? statusError,
    updateMember,
    updateMemberStatus,
    refetch,
  };
}

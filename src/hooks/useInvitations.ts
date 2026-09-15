'use client';

import { useCallback } from 'react';
import { invitationService } from '@/lib/api';
import type { AcceptInvitationInput, CreateInvitationInput } from '@/lib/api';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useInvites() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('invitations.list', () => invitationService.getAllPending());

  const {
    mutate: revokeMutate,
    isLoading: isRevoking,
    error: revokeError,
  } = useApiMutation(invitationService.revoke);

  const revokeInvite = useCallback(
    async (id: string) => {
      await revokeMutate(id);
      await refetch();
    },
    [revokeMutate, refetch],
  );

  return {
    invites: data ?? [],
    isLoading,
    isRevoking,
    error: fetchError ?? revokeError,
    revokeInvite,
    refetch,
  };
}

export function useInviteMember() {
  const {
    mutate,
    isLoading,
    error,
    reset,
  } = useApiMutation(invitationService.create);

  const inviteMember = useCallback(
    async (input: CreateInvitationInput) => mutate(input),
    [mutate],
  );

  return { inviteMember, isLoading, error, reset };
}

export function useValidateInvite(token: string | null) {
  return useApiQuery(
    `invitations.validate.${token ?? 'none'}`,
    () => invitationService.validateToken(token!),
    { enabled: Boolean(token) },
  );
}

export function useAcceptInvite(token: string | null) {
  const {
    mutate,
    isLoading,
    error,
    reset,
  } = useApiMutation((input: AcceptInvitationInput) =>
    invitationService.accept(token!, input),
  );

  const acceptInvite = useCallback(
    async (input: AcceptInvitationInput) => mutate(input),
    [mutate],
  );

  return { acceptInvite, isLoading, error, reset };
}

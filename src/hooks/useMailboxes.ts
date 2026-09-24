'use client';

import { useCallback } from 'react';
import { mailboxService } from '@/lib/api';
import type {
  CreateMailboxInput,
  MailboxStatus,
  UpdateMailboxInput,
} from '@/lib/email/mailbox-types';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { invalidateQuery } from '@/hooks/api/query-cache';

function invalidateMailboxDetailQueries(id: string) {
  invalidateQuery(`mailboxes.detail.${id}`);
  invalidateQuery(`mailboxes.campaigns.${id}`);
}

export function useMailboxes() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('mailboxes.list', () => mailboxService.getAll());

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateMailboxInput) => mailboxService.create(input));

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(({ id, input }: { id: string; input: UpdateMailboxInput }) =>
    mailboxService.update(id, input),
  );

  const {
    mutate: statusMutate,
    isLoading: isUpdatingStatus,
    error: statusError,
  } = useApiMutation(({ id, status }: { id: string; status: MailboxStatus }) =>
    mailboxService.updateStatus(id, status),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation((id: string) => mailboxService.delete(id));

  const createMailbox = useCallback(
    async (input: CreateMailboxInput) => {
      const created = await createMutate(input);
      await refetch();
      return created;
    },
    [createMutate, refetch],
  );

  const updateMailbox = useCallback(
    async (id: string, input: UpdateMailboxInput) => {
      await updateMutate({ id, input });
      invalidateMailboxDetailQueries(id);
      await refetch();
    },
    [updateMutate, refetch],
  );

  const setMailboxStatus = useCallback(
    async (id: string, status: MailboxStatus) => {
      await statusMutate({ id, status });
      invalidateMailboxDetailQueries(id);
      await refetch();
    },
    [statusMutate, refetch],
  );

  const deleteMailbox = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      invalidateMailboxDetailQueries(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    mailboxes: data ?? [],
    isLoading,
    isSaving: isCreating || isUpdating || isUpdatingStatus || isDeleting,
    isDeleting,
    error: fetchError ?? createError ?? updateError ?? statusError ?? deleteError,
    createMailbox,
    updateMailbox,
    setMailboxStatus,
    deleteMailbox,
  };
}

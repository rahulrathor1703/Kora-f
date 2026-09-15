'use client';

import { useCallback } from 'react';
import {
  emailExcludedService,
  type AssignAudienceContactToListInput,
  type CreateAudienceContactInput,
  type EmailExcludedListContactsQuery,
  type EmailExcludedListType,
} from '@/lib/api/services/email-excluded.service';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useEmailExcluded() {
  const { data, error, isLoading, refetch } = useApiQuery(
    'email-excluded.list',
    () => emailExcludedService.getAll(),
  );

  const { mutate: removeMutate, isLoading: isRemoving } = useApiMutation(
    (id: string) => emailExcludedService.remove(id),
  );

  const { mutate: addMutate, isLoading: isAdding } = useApiMutation(
    (email: string) => emailExcludedService.add(email),
  );

  const { mutate: excludeFromListMutate, isLoading: isExcludingList } =
    useApiMutation(
      ({
        listId,
        listType,
      }: {
        listId: string;
        listType: EmailExcludedListType;
      }) => emailExcludedService.excludeFromList(listId, listType),
    );

  const removeAddress = useCallback(
    async (id: string) => {
      await removeMutate(id);
      await refetch();
    },
    [removeMutate, refetch],
  );

  const addAddress = useCallback(
    async (email: string) => {
      await addMutate(email);
      await refetch();
    },
    [addMutate, refetch],
  );

  const excludeFromList = useCallback(
    async (listId: string, listType: EmailExcludedListType) => {
      const result = await excludeFromListMutate({ listId, listType });
      await refetch();
      return result;
    },
    [excludeFromListMutate, refetch],
  );

  return {
    addresses: data ?? [],
    isLoading,
    isRemoving,
    isAdding,
    isExcludingList,
    error,
    refetch,
    removeAddress,
    addAddress,
    excludeFromList,
  };
}

export function useCreateAudienceContact() {
  const { mutate, isLoading, error } = useApiMutation(
    (input: CreateAudienceContactInput) =>
      emailExcludedService.createListContact(input),
  );

  return {
    createAudienceContact: mutate,
    isCreating: isLoading,
    error,
  };
}

export function useAssignAudienceContactToList() {
  const { mutate, isLoading, error } = useApiMutation(
    (input: AssignAudienceContactToListInput) =>
      emailExcludedService.assignListContact(input),
  );

  return {
    assignAudienceContactToList: mutate,
    isAssigning: isLoading,
    error,
  };
}

export function useEmailExcludedListContacts(
  query: EmailExcludedListContactsQuery & { enabled?: boolean },
) {
  const { enabled = true, ...requestQuery } = query;
  const queryKey = [
    'email-excluded.list-contacts',
    requestQuery.search ?? '',
    requestQuery.page ?? 1,
    requestQuery.limit ?? 25,
    requestQuery.includeManual === false ? '0' : '1',
  ].join('.');

  return useApiQuery(
    queryKey,
    () => emailExcludedService.getListContacts(requestQuery),
    { enabled },
  );
}

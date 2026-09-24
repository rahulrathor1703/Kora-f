'use client';

import { useCallback } from 'react';
import { contactListService } from '@/lib/api/services/contact-list.service';
import type {
  ContactListAppendImportInput,
  ContactListEnrollMembersInput,
  ContactListMembersQuery,
  CreateContactListMemberInput,
  ListCampaignRemovalAction,
} from '@/lib/email/lists/detail-types';
import type { ContactListImportInput } from '@/lib/email/lists/types';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useContactLists() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('contact-lists.list', () => contactListService.getAll());

  const {
    mutate: importMutate,
    isLoading: isImporting,
    error: importError,
  } = useApiMutation(
    ({ file, input }: { file: File; input: ContactListImportInput }) =>
      contactListService.importList(file, input),
  );

  const importList = useCallback(
    async (file: File, input: ContactListImportInput) => {
      const result = await importMutate({ file, input });
      await refetch();
      return result;
    },
    [importMutate, refetch],
  );

  return {
    lists: data ?? [],
    isLoading,
    isImporting,
    error: fetchError ?? importError,
    refetch,
    importList,
  };
}

export function useContactList(id: string) {
  return useApiQuery(
    `contact-lists.detail.${id}`,
    () => contactListService.getById(id),
    { enabled: Boolean(id) },
  );
}

export function useContactListMembers(
  id: string,
  query: ContactListMembersQuery,
) {
  const queryKey = [
    'contact-lists.members',
    id,
    query.search ?? '',
    query.emailStatus ?? '',
    query.page ?? 1,
    query.pageSize ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => contactListService.getMembers(id, query),
    { enabled: Boolean(id) },
  );
}

export function useContactListMutations(id: string) {
  const detailKey = `contact-lists.detail.${id}`;

  const {
    mutate: addMemberMutate,
    isLoading: isAddingMember,
    error: addMemberError,
  } = useApiMutation((input: CreateContactListMemberInput) =>
    contactListService.addMember(id, input),
  );

  const {
    mutate: appendImportMutate,
    isLoading: isAppendingImport,
    error: appendImportError,
  } = useApiMutation(
    ({ file, input }: { file: File; input: ContactListAppendImportInput }) =>
      contactListService.appendImport(id, file, input),
  );

  const {
    mutate: removeMemberMutate,
    isLoading: isRemovingMember,
    error: removeMemberError,
  } = useApiMutation(
    ({
      memberId,
      campaignActions,
    }: {
      memberId: string;
      campaignActions?: ListCampaignRemovalAction[];
    }) => contactListService.removeMember(id, memberId, campaignActions),
  );

  const {
    mutate: enrollMembersMutate,
    isLoading: isEnrollingMembers,
    error: enrollMembersError,
  } = useApiMutation((input: ContactListEnrollMembersInput) =>
    contactListService.enrollMembersInCampaigns(id, input),
  );

  return {
    addMember: addMemberMutate,
    appendImport: appendImportMutate,
    removeMember: removeMemberMutate,
    enrollMembersInCampaigns: enrollMembersMutate,
    isAddingMember,
    isAppendingImport,
    isRemovingMember,
    isEnrollingMembers,
    error:
      addMemberError ??
      appendImportError ??
      removeMemberError ??
      enrollMembersError,
    detailKey,
  };
}

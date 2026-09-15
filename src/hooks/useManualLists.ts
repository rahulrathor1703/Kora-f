'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { manualListService } from '@/lib/api/services/manual-list.service';
import type {
  CreateManualListInput,
  CreateManualListRowInput,
  ManualListAppendImportInput,
  ManualListEnrollRowsInput,
} from '@/lib/lists/types';
import type { ListCampaignRemovalAction } from '@/lib/email/lists/detail-types';

export function useManualLists() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('manual-lists.list', () => manualListService.getAll());

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateManualListInput) =>
    manualListService.create(input),
  );

  const createList = useCallback(
    async (input: CreateManualListInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  return {
    lists: data ?? [],
    isLoading,
    isCreating,
    error: fetchError ?? createError,
    refetch,
    createList,
  };
}

export function useManualListDetail(id: string) {
  return useApiQuery(
    `manual-lists.detail.${id}`,
    () => manualListService.getById(id),
    { enabled: Boolean(id) },
  );
}

export function useManualListMutations(id: string) {
  const {
    mutate: addRowMutate,
    isLoading: isAddingRow,
    error: addRowError,
  } = useApiMutation((input: CreateManualListRowInput) =>
    manualListService.addRow(id, input),
  );

  const {
    mutate: appendImportMutate,
    isLoading: isAppendingImport,
    error: appendImportError,
  } = useApiMutation(
    ({ file, input }: { file: File; input: ManualListAppendImportInput }) =>
      manualListService.appendImport(id, file, input),
  );

  const {
    mutate: removeRowMutate,
    isLoading: isRemovingRow,
    error: removeRowError,
  } = useApiMutation(
    ({
      rowId,
      campaignActions,
    }: {
      rowId: string;
      campaignActions?: ListCampaignRemovalAction[];
    }) => manualListService.removeRow(id, rowId, campaignActions),
  );

  const {
    mutate: enrollRowsMutate,
    isLoading: isEnrollingRows,
    error: enrollRowsError,
  } = useApiMutation((input: ManualListEnrollRowsInput) =>
    manualListService.enrollRowsInCampaigns(id, input),
  );

  return {
    addRow: addRowMutate,
    appendImport: appendImportMutate,
    removeRow: removeRowMutate,
    enrollRowsInCampaigns: enrollRowsMutate,
    isAddingRow,
    isAppendingImport,
    isRemovingRow,
    isEnrollingRows,
    error:
      addRowError ??
      appendImportError ??
      removeRowError ??
      enrollRowsError,
  };
}

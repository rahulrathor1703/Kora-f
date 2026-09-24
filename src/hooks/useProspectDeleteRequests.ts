'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { prospectsService } from '@/lib/api/services/prospects.service';
import type {
  CreateProspectDeleteRequestInput,
  ProspectDeleteRequestsQuery,
  RejectProspectDeleteRequestInput,
} from '@/lib/crm/prospects/types';

export function useProspectDeleteRequests(
  query: ProspectDeleteRequestsQuery = {},
) {
  const orgScopeKey = useOrgScopeKey();
  const queryKey = [
    'prospects.delete-requests',
    orgScopeKey,
    query.status ?? '',
    query.prospectId ?? '',
  ].join('.');

  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () => prospectsService.getDeleteRequests(query));

  const { refetch: refetchSummaryCounts } = useDeleteRequestSummaryCounts(true);

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateProspectDeleteRequestInput) =>
    prospectsService.createDeleteRequest(input),
  );

  const {
    mutate: approveMutate,
    isLoading: isApproving,
    error: approveError,
  } = useApiMutation((id: string) => prospectsService.approveDeleteRequest(id));

  const {
    mutate: rejectMutate,
    isLoading: isRejecting,
    error: rejectError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: RejectProspectDeleteRequestInput }) =>
      prospectsService.rejectDeleteRequest(id, input),
  );

  const {
    mutate: cancelMutate,
    isLoading: isCancelling,
    error: cancelError,
  } = useApiMutation((id: string) => prospectsService.cancelDeleteRequest(id));

  const createDeleteRequest = useCallback(
    async (input: CreateProspectDeleteRequestInput) => {
      const result = await createMutate(input);
      await Promise.all([refetch(), refetchSummaryCounts()]);
      return result;
    },
    [createMutate, refetch, refetchSummaryCounts],
  );

  const approveDeleteRequest = useCallback(
    async (id: string) => {
      const result = await approveMutate(id);
      await Promise.all([refetch(), refetchSummaryCounts()]);
      return result;
    },
    [approveMutate, refetch, refetchSummaryCounts],
  );

  const rejectDeleteRequest = useCallback(
    async (id: string, input: RejectProspectDeleteRequestInput) => {
      const result = await rejectMutate({ id, input });
      await Promise.all([refetch(), refetchSummaryCounts()]);
      return result;
    },
    [rejectMutate, refetch, refetchSummaryCounts],
  );

  const cancelDeleteRequest = useCallback(
    async (id: string) => {
      const result = await cancelMutate(id);
      await Promise.all([refetch(), refetchSummaryCounts()]);
      return result;
    },
    [cancelMutate, refetch, refetchSummaryCounts],
  );

  return {
    requests: data ?? [],
    isLoading,
    isCreating,
    isApproving,
    isRejecting,
    isCancelling,
    error: fetchError ?? createError ?? approveError ?? rejectError ?? cancelError,
    createDeleteRequest,
    approveDeleteRequest,
    rejectDeleteRequest,
    cancelDeleteRequest,
    refetch,
  };
}

export function useDeleteRequestSummaryCounts(enabled = true) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `prospects.delete-requests.summary-count.${orgScopeKey}`,
    () => prospectsService.getDeleteRequestSummaryCounts(),
    { enabled },
  );
}

export function usePendingDeleteRequestCount(enabled = true) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `prospects.delete-requests.pending-count.${orgScopeKey}`,
    () => prospectsService.getPendingDeleteRequestCount(),
    { enabled },
  );
}

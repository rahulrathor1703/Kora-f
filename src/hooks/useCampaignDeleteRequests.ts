'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { emailCampaignService } from '@/lib/api/services/email-campaign.service';
import type {
  CampaignDeleteRequestsQuery,
  CreateCampaignDeleteRequestInput,
  RejectCampaignDeleteRequestInput,
} from '@/lib/email/campaigns/types';

export function useCampaignDeleteRequests(
  query: CampaignDeleteRequestsQuery = {},
) {
  const orgScopeKey = useOrgScopeKey();
  const queryKey = [
    'email-campaigns.delete-requests',
    orgScopeKey,
    query.status ?? '',
    query.campaignId ?? '',
  ].join('.');

  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () => emailCampaignService.getDeleteRequests(query));

  const { refetch: refetchSummaryCounts } =
    useCampaignDeleteRequestSummaryCounts(true);

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateCampaignDeleteRequestInput) =>
    emailCampaignService.createDeleteRequest(input),
  );

  const {
    mutate: approveMutate,
    isLoading: isApproving,
    error: approveError,
  } = useApiMutation((id: string) =>
    emailCampaignService.approveDeleteRequest(id),
  );

  const {
    mutate: rejectMutate,
    isLoading: isRejecting,
    error: rejectError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: RejectCampaignDeleteRequestInput }) =>
      emailCampaignService.rejectDeleteRequest(id, input),
  );

  const {
    mutate: cancelMutate,
    isLoading: isCancelling,
    error: cancelError,
  } = useApiMutation((id: string) =>
    emailCampaignService.cancelDeleteRequest(id),
  );

  const createDeleteRequest = useCallback(
    async (input: CreateCampaignDeleteRequestInput) => {
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
    async (id: string, input: RejectCampaignDeleteRequestInput) => {
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
    error:
      fetchError ?? createError ?? approveError ?? rejectError ?? cancelError,
    createDeleteRequest,
    approveDeleteRequest,
    rejectDeleteRequest,
    cancelDeleteRequest,
    refetch,
  };
}

export function useCampaignDeleteRequestSummaryCounts(enabled = true) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `email-campaigns.delete-requests.summary-count.${orgScopeKey}`,
    () => emailCampaignService.getDeleteRequestSummaryCounts(),
    { enabled },
  );
}

export function usePendingCampaignDeleteRequestCount(enabled = true) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `email-campaigns.delete-requests.pending-count.${orgScopeKey}`,
    () => emailCampaignService.getPendingDeleteRequestCount(),
    { enabled },
  );
}

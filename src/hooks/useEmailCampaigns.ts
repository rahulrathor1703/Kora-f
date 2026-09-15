'use client';

import { useCallback } from 'react';
import { emailCampaignService } from '@/lib/api';
import type {
  CreateEmailCampaignInput,
  EmailCampaignStatus,
  UpdateEmailCampaignInput,
} from '@/lib/email/campaigns/types';
import type { CampaignRecipientsQuery } from '@/lib/email/campaigns/recipient-types';
import type { CampaignEventsQuery } from '@/lib/email/campaigns/event-types';
import type { SyncTrackingResult } from '@/lib/email/campaigns/progress-types';
import { invalidateQueriesByPrefix, invalidateQuery, useApiMutation, useApiQuery } from '@/hooks/api';

/** Poll active campaigns every 2s so opens/clicks/bounces show up near-instantly. */
export const CAMPAIGN_TRACKING_POLL_INTERVAL_MS = 2_000;

export function getCampaignTrackingPollIntervalMs(
  status: EmailCampaignStatus | null | undefined,
): number | undefined {
  if (
    !status ||
    status === 'draft' ||
    status === 'stopped' ||
    status === 'failed'
  ) {
    return undefined;
  }

  return CAMPAIGN_TRACKING_POLL_INTERVAL_MS;
}

function resolveCampaignTrackingPollIntervalMs(
  campaignId: string | null,
  status: EmailCampaignStatus | null | undefined,
): number | undefined {
  const resolved = getCampaignTrackingPollIntervalMs(status);
  if (resolved !== undefined) {
    return resolved;
  }

  // Poll while campaign status is still loading on the detail page.
  if (campaignId && status === undefined) {
    return CAMPAIGN_TRACKING_POLL_INTERVAL_MS;
  }

  return undefined;
}

const campaignTrackingQueryOptions = {
  refetchOnWindowFocus: true,
} as const;

interface CampaignTrackingQueryOptions {
  campaignStatus?: EmailCampaignStatus | null;
}

export function useEmailCampaigns() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('email-campaigns.list', () => emailCampaignService.getAll());

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateEmailCampaignInput) =>
    emailCampaignService.create(input),
  );

  const createCampaign = useCallback(
    async (input: CreateEmailCampaignInput) => {
      await createMutate(input);
      await refetch();
    },
    [createMutate, refetch],
  );

  const {
    mutate: updateStatusMutate,
    isLoading: isUpdatingStatus,
    error: updateStatusError,
  } = useApiMutation(
    ({ id, status }: { id: string; status: EmailCampaignStatus }) =>
      emailCampaignService.updateStatus(id, { status }),
  );

  const updateCampaignStatus = useCallback(
    async (id: string, status: EmailCampaignStatus) => {
      await updateStatusMutate({ id, status });
      await refetch();
    },
    [updateStatusMutate, refetch],
  );

  return {
    campaigns: data ?? [],
    isLoading,
    isCreating,
    isUpdatingStatus,
    error: fetchError ?? createError ?? updateStatusError,
    createCampaign,
    updateCampaignStatus,
    refetch,
  };
}

export function useUpdateEmailCampaign() {
  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateEmailCampaignInput }) =>
      emailCampaignService.update(id, input),
  );

  const updateCampaign = useCallback(
    async (id: string, input: UpdateEmailCampaignInput) => {
      return updateMutate({ id, input });
    },
    [updateMutate],
  );

  return {
    updateCampaign,
    isUpdating,
    error: updateError,
  };
}

export function useUpdateEmailCampaignStatus(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const onSuccess = options?.onSuccess;

  const {
    mutate: updateStatusMutate,
    isLoading: isUpdatingStatus,
    error: updateStatusError,
  } = useApiMutation(
    ({ id, status }: { id: string; status: EmailCampaignStatus }) =>
      emailCampaignService.updateStatus(id, { status }),
  );

  const updateCampaignStatus = useCallback(
    async (id: string, status: EmailCampaignStatus) => {
      await updateStatusMutate({ id, status });
      if (onSuccess) {
        await onSuccess();
      }
    },
    [onSuccess, updateStatusMutate],
  );

  return {
    updateCampaignStatus,
    isUpdatingStatus,
    error: updateStatusError,
  };
}

export function useEmailCampaign(id: string | null) {
  return useApiQuery(
    `email-campaigns.detail.${id ?? 'none'}`,
    () => emailCampaignService.getById(id!),
    {
      enabled: Boolean(id),
      refetchIntervalMs: id ? CAMPAIGN_TRACKING_POLL_INTERVAL_MS : undefined,
      refetchOnWindowFocus: Boolean(id),
    },
  );
}

export function useEmailCampaignProgress(
  id: string | null,
  options: CampaignTrackingQueryOptions = {},
) {
  return useApiQuery(
    `email-campaigns.progress.${id ?? 'none'}`,
    () => emailCampaignService.getProgress(id!),
    {
      enabled: Boolean(id),
      refetchIntervalMs: resolveCampaignTrackingPollIntervalMs(
        id,
        options.campaignStatus,
      ),
      ...campaignTrackingQueryOptions,
    },
  );
}

export function useCampaignTrackingStatus() {
  return useApiQuery('email-campaigns.tracking-status', () =>
    emailCampaignService.getTrackingStatus(),
  );
}

export function useCampaignTrackingHealth(campaignId: string | null) {
  return useApiQuery(
    `email-campaigns.tracking-health.${campaignId ?? 'none'}`,
    () => emailCampaignService.getTrackingHealth(campaignId!),
    { enabled: Boolean(campaignId) },
  );
}

export function useCampaignDailyEvents(
  campaignId: string | null,
  options: CampaignTrackingQueryOptions = {},
) {
  return useApiQuery(
    `email-campaigns.daily-events.${campaignId ?? 'none'}`,
    () => emailCampaignService.getDailyEvents(campaignId!),
    {
      enabled: Boolean(campaignId),
      refetchIntervalMs: resolveCampaignTrackingPollIntervalMs(
        campaignId,
        options.campaignStatus,
      ),
      ...campaignTrackingQueryOptions,
    },
  );
}

export function invalidateCampaignTrackingQueries(campaignId: string): void {
  invalidateQuery(`email-campaigns.progress.${campaignId}`);
  invalidateQuery(`email-campaigns.daily-events.${campaignId}`);
  invalidateQuery(`email-campaigns.tracking-health.${campaignId}`);
  invalidateQueriesByPrefix(`email-campaigns.events.${campaignId}`);
  invalidateQueriesByPrefix(`email-campaigns.recipients.${campaignId}`);
  invalidateQueriesByPrefix(`email-campaigns.recipient-events.${campaignId}`);
}

export function useSyncCampaignTracking() {
  return useApiMutation<void, SyncTrackingResult>(async () =>
    emailCampaignService.syncTracking(),
  );
}

export function useCampaignRecipients(
  campaignId: string | null,
  query: CampaignRecipientsQuery,
  options: CampaignTrackingQueryOptions = {},
) {
  const queryKey = [
    'email-campaigns.recipients',
    campaignId ?? 'none',
    query.search ?? '',
    query.status ?? '',
    query.disposition ?? '',
    query.page ?? 1,
    query.limit ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => emailCampaignService.getRecipients(campaignId!, query),
    {
      enabled: Boolean(campaignId),
      refetchIntervalMs: resolveCampaignTrackingPollIntervalMs(
        campaignId,
        options.campaignStatus,
      ),
      ...campaignTrackingQueryOptions,
    },
  );
}

export function useCampaignEvents(
  campaignId: string | null,
  query: CampaignEventsQuery,
  options: CampaignTrackingQueryOptions = {},
) {
  const queryKey = [
    'email-campaigns.events',
    campaignId ?? 'none',
    query.search ?? '',
    query.eventType ?? '',
    query.recipientId ?? '',
    query.stepOrder ?? '',
    query.page ?? 1,
    query.limit ?? 50,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => emailCampaignService.getEvents(campaignId!, query),
    {
      enabled: Boolean(campaignId),
      refetchIntervalMs: resolveCampaignTrackingPollIntervalMs(
        campaignId,
        options.campaignStatus,
      ),
      ...campaignTrackingQueryOptions,
    },
  );
}

export function useCampaignRecipientEvents(
  campaignId: string | null,
  recipientId: string | null,
  options: CampaignTrackingQueryOptions = {},
) {
  return useApiQuery(
    `email-campaigns.recipient-events.${campaignId ?? 'none'}.${recipientId ?? 'none'}`,
    () =>
      emailCampaignService.getRecipientEvents(campaignId!, recipientId!, 1, 100),
    {
      enabled: Boolean(campaignId && recipientId),
      refetchIntervalMs: resolveCampaignTrackingPollIntervalMs(
        campaignId,
        options.campaignStatus,
      ),
      ...campaignTrackingQueryOptions,
    },
  );
}

export function useCampaignRecipient(
  campaignId: string | null,
  recipientId: string | null,
  options: CampaignTrackingQueryOptions = {},
) {
  return useApiQuery(
    `email-campaigns.recipient.${campaignId ?? 'none'}.${recipientId ?? 'none'}`,
    () => emailCampaignService.getRecipient(campaignId!, recipientId!),
    {
      enabled: Boolean(campaignId && recipientId),
      refetchIntervalMs: resolveCampaignTrackingPollIntervalMs(
        campaignId,
        options.campaignStatus,
      ),
      ...campaignTrackingQueryOptions,
    },
  );
}

export function useDeleteEmailCampaign() {
  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation((id: string) => emailCampaignService.delete(id));

  const deleteCampaign = useCallback(async (id: string) => {
    await deleteMutate(id);
  }, [deleteMutate]);

  return {
    deleteCampaign,
    isDeleting,
    error: deleteError,
  };
}

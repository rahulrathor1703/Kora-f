'use client';

import { useCallback, useMemo } from 'react';
import { emailCampaignService } from '@/lib/api';
import type { CampaignAudienceQuery } from '@/lib/email/campaigns/audience-types';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useNotify } from '@/hooks/useNotify';

export function useCampaignAudienceRecipients(query: CampaignAudienceQuery) {
  const queryKey = [
    'email-campaigns.audience',
    query.campaignId ?? '',
    query.disposition ?? 'all',
    query.search ?? '',
    query.page ?? 1,
    query.limit ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => emailCampaignService.getAudienceRecipients(query),
  );
}

export function useCampaignRecipientExclusionActions(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const { notifyError, notifySuccess } = useNotify();

  const { mutate: excludeMutate, isLoading: isExcluding } = useApiMutation(
    (input: { campaignId: string; recipientId: string }) =>
      emailCampaignService.excludeRecipient(input.campaignId, input.recipientId),
  );

  const { mutate: includeMutate, isLoading: isIncluding } = useApiMutation(
    (input: { campaignId: string; recipientId: string }) =>
      emailCampaignService.includeRecipient(input.campaignId, input.recipientId),
  );

  const onSuccess = options?.onSuccess;

  const runAction = useCallback(
    async (
      action: 'exclude' | 'include',
      campaignId: string,
      recipientId: string,
      email: string,
    ) => {
      try {
        if (action === 'exclude') {
          await excludeMutate({ campaignId, recipientId });
          notifySuccess(`${email} excluded from campaign`);
        } else {
          await includeMutate({ campaignId, recipientId });
          notifySuccess(`${email} included in campaign`);
        }

        if (onSuccess) {
          await onSuccess();
        }
      } catch {
        notifyError(
          action === 'exclude'
            ? `Failed to exclude ${email}`
            : `Failed to include ${email}`,
        );
      }
    },
    [excludeMutate, includeMutate, notifyError, notifySuccess, onSuccess],
  );

  const excludeRecipient = useCallback(
    (campaignId: string, recipientId: string, email: string) =>
      runAction('exclude', campaignId, recipientId, email),
    [runAction],
  );

  const includeRecipient = useCallback(
    (campaignId: string, recipientId: string, email: string) =>
      runAction('include', campaignId, recipientId, email),
    [runAction],
  );

  return useMemo(
    () => ({
      excludeRecipient,
      includeRecipient,
      isUpdating: isExcluding || isIncluding,
    }),
    [excludeRecipient, includeRecipient, isExcluding, isIncluding],
  );
}

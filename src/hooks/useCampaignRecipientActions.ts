'use client';

import { useCallback, useMemo } from 'react';
import { emailCampaignService } from '@/lib/api';
import { useApiMutation } from '@/hooks/api';
import { useNotify } from '@/hooks/useNotify';

function formatPauseDate(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function useCampaignRecipientActions(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const { notifyError, notifySuccess } = useNotify();
  const onSuccess = options?.onSuccess;

  const { mutate: pauseMutate, isLoading: isPausing } = useApiMutation(
    (input: { campaignId: string; recipientId: string; pausedUntil: string }) =>
      emailCampaignService.pauseRecipient(input.campaignId, input.recipientId, {
        pausedUntil: input.pausedUntil,
      }),
  );

  const { mutate: stopMutate, isLoading: isStopping } = useApiMutation(
    (input: { campaignId: string; recipientId: string }) =>
      emailCampaignService.stopRecipient(input.campaignId, input.recipientId),
  );

  const { mutate: resumeMutate, isLoading: isResuming } = useApiMutation(
    (input: { campaignId: string; recipientId: string }) =>
      emailCampaignService.resumeRecipient(input.campaignId, input.recipientId),
  );

  const { mutate: excludeMutate, isLoading: isExcluding } = useApiMutation(
    (input: { campaignId: string; recipientId: string }) =>
      emailCampaignService.excludeRecipientGlobally(
        input.campaignId,
        input.recipientId,
      ),
  );

  const runSuccess = useCallback(async () => {
    if (onSuccess) {
      await onSuccess();
    }
  }, [onSuccess]);

  const pauseRecipient = useCallback(
    async (
      campaignId: string,
      recipientId: string,
      email: string,
      pausedUntil: string,
    ) => {
      try {
        await pauseMutate({ campaignId, recipientId, pausedUntil });
        notifySuccess(`Paused ${email} until ${formatPauseDate(pausedUntil)}`);
        await runSuccess();
      } catch {
        notifyError(`Failed to pause ${email}`);
      }
    },
    [notifyError, notifySuccess, pauseMutate, runSuccess],
  );

  const stopRecipient = useCallback(
    async (campaignId: string, recipientId: string, email: string) => {
      try {
        await stopMutate({ campaignId, recipientId });
        notifySuccess(`Stopped ${email} for this campaign`);
        await runSuccess();
      } catch {
        notifyError(`Failed to stop ${email}`);
      }
    },
    [notifyError, notifySuccess, runSuccess, stopMutate],
  );

  const resumeRecipient = useCallback(
    async (campaignId: string, recipientId: string, email: string) => {
      try {
        await resumeMutate({ campaignId, recipientId });
        notifySuccess(`Resumed ${email} in this campaign`);
        await runSuccess();
      } catch {
        notifyError(`Failed to resume ${email}`);
      }
    },
    [notifyError, notifySuccess, resumeMutate, runSuccess],
  );

  const excludeRecipient = useCallback(
    async (campaignId: string, recipientId: string, email: string) => {
      try {
        await excludeMutate({ campaignId, recipientId });
        notifySuccess(`Excluded ${email} from all future campaigns`);
        await runSuccess();
      } catch {
        notifyError(`Failed to exclude ${email}`);
      }
    },
    [excludeMutate, notifyError, notifySuccess, runSuccess],
  );

  return useMemo(
    () => ({
      pauseRecipient,
      stopRecipient,
      resumeRecipient,
      excludeRecipient,
      isUpdating: isPausing || isStopping || isResuming || isExcluding,
    }),
    [
      excludeRecipient,
      isExcluding,
      isPausing,
      isResuming,
      isStopping,
      pauseRecipient,
      resumeRecipient,
      stopRecipient,
    ],
  );
}

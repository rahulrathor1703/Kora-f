'use client';

import { useCallback, useMemo } from 'react';
import { emailCampaignService, getApiErrorMessage } from '@/lib/api';
import { useApiMutation } from '@/hooks/api';
import { useNotify } from '@/hooks/useNotify';
import type { ResumeEmailCampaignInput } from '@/lib/email/campaigns/types';

function formatPauseDate(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function useCampaignActions(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const { notifyError, notifySuccess } = useNotify();
  const onSuccess = options?.onSuccess;

  const { mutate: pauseMutate, isLoading: isPausing } = useApiMutation(
    (input: { campaignId: string; pausedUntil: string }) =>
      emailCampaignService.pauseCampaign(input.campaignId, {
        pausedUntil: input.pausedUntil,
      }),
  );

  const { mutate: stopMutate, isLoading: isStopping } = useApiMutation(
    (campaignId: string) => emailCampaignService.stopCampaign(campaignId),
  );

  const { mutate: resumeMutate, isLoading: isResuming } = useApiMutation(
    (input: { campaignId: string; payload?: ResumeEmailCampaignInput }) =>
      emailCampaignService.resumeCampaign(input.campaignId, input.payload),
  );

  const runSuccess = useCallback(async () => {
    if (onSuccess) {
      await onSuccess();
    }
  }, [onSuccess]);

  const pauseCampaign = useCallback(
    async (campaignId: string, name: string, pausedUntil: string) => {
      try {
        await pauseMutate({ campaignId, pausedUntil });
        notifySuccess(`Paused "${name}" until ${formatPauseDate(pausedUntil)}`);
        await runSuccess();
      } catch (error) {
        notifyError(getApiErrorMessage(error, `Failed to pause "${name}"`));
      }
    },
    [notifyError, notifySuccess, pauseMutate, runSuccess],
  );

  const stopCampaign = useCallback(
    async (campaignId: string, name: string) => {
      try {
        await stopMutate(campaignId);
        notifySuccess(`Stopped "${name}"`);
        await runSuccess();
      } catch (error) {
        notifyError(getApiErrorMessage(error, `Failed to stop "${name}"`));
      }
    },
    [notifyError, notifySuccess, runSuccess, stopMutate],
  );

  const resumeCampaign = useCallback(
    async (
      campaignId: string,
      name: string,
      options?: ResumeEmailCampaignInput,
    ) => {
      try {
        await resumeMutate({ campaignId, payload: options });
        if (options?.resumePausedMailboxSenders) {
          notifySuccess(`Resumed "${name}" and its paused mailboxes`);
        } else {
          notifySuccess(`Resumed "${name}"`);
        }
        await runSuccess();
      } catch (error) {
        notifyError(getApiErrorMessage(error, `Failed to resume "${name}"`));
      }
    },
    [notifyError, notifySuccess, resumeMutate, runSuccess],
  );

  return useMemo(
    () => ({
      pauseCampaign,
      stopCampaign,
      resumeCampaign,
      isUpdating: isPausing || isStopping || isResuming,
    }),
    [
      isPausing,
      isResuming,
      isStopping,
      pauseCampaign,
      resumeCampaign,
      stopCampaign,
    ],
  );
}

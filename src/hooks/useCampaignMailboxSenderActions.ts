'use client';

import { useCallback, useMemo } from 'react';
import { emailCampaignService, getApiErrorMessage } from '@/lib/api';
import { useApiMutation } from '@/hooks/api';
import { useNotify } from '@/hooks/useNotify';
import type {
  CreateEmailCampaignMailboxSenderInput,
  PauseCampaignMailboxSenderInput,
  StopCampaignMailboxSenderInput,
  UpdateCampaignMailboxSenderInput,
} from '@/lib/email/campaigns/types';

function formatPauseDate(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function useCampaignMailboxSenderActions(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const { notifyError, notifySuccess } = useNotify();
  const onSuccess = options?.onSuccess;

  const { mutate: addMutate, isLoading: isAdding } = useApiMutation(
    (input: {
      campaignId: string;
      payload: CreateEmailCampaignMailboxSenderInput;
    }) =>
      emailCampaignService.addCampaignMailboxSender(
        input.campaignId,
        input.payload,
      ),
  );

  const { mutate: updateMutate, isLoading: isUpdatingSender } = useApiMutation(
    (input: {
      campaignId: string;
      senderId: string;
      payload: UpdateCampaignMailboxSenderInput;
    }) =>
      emailCampaignService.updateCampaignMailboxSender(
        input.campaignId,
        input.senderId,
        input.payload,
      ),
  );

  const { mutate: pauseMutate, isLoading: isPausing } = useApiMutation(
    (input: {
      campaignId: string;
      senderId: string;
      payload?: PauseCampaignMailboxSenderInput;
    }) =>
      emailCampaignService.pauseCampaignMailboxSender(
        input.campaignId,
        input.senderId,
        input.payload,
      ),
  );

  const { mutate: stopMutate, isLoading: isStopping } = useApiMutation(
    (input: {
      campaignId: string;
      senderId: string;
      payload?: StopCampaignMailboxSenderInput;
    }) =>
      emailCampaignService.stopCampaignMailboxSender(
        input.campaignId,
        input.senderId,
        input.payload,
      ),
  );

  const { mutate: resumeMutate, isLoading: isResuming } = useApiMutation(
    (input: { campaignId: string; senderId: string }) =>
      emailCampaignService.resumeCampaignMailboxSender(
        input.campaignId,
        input.senderId,
      ),
  );

  const runSuccess = useCallback(async () => {
    if (onSuccess) {
      await onSuccess();
    }
  }, [onSuccess]);

  const addMailboxSender = useCallback(
    async (
      campaignId: string,
      payload: CreateEmailCampaignMailboxSenderInput,
      mailboxLabel: string,
    ) => {
      try {
        await addMutate({ campaignId, payload });
        notifySuccess(`Added ${mailboxLabel} to this campaign`);
        await runSuccess();
      } catch (error) {
        notifyError(getApiErrorMessage(error, `Failed to add ${mailboxLabel}`));
      }
    },
    [addMutate, notifyError, notifySuccess, runSuccess],
  );

  const updateMailboxSender = useCallback(
    async (
      campaignId: string,
      senderId: string,
      payload: UpdateCampaignMailboxSenderInput,
      mailboxLabel: string,
    ) => {
      try {
        await updateMutate({ campaignId, senderId, payload });
        notifySuccess(`Updated ${mailboxLabel}`);
        await runSuccess();
      } catch (error) {
        notifyError(
          getApiErrorMessage(error, `Failed to update ${mailboxLabel}`),
        );
      }
    },
    [notifyError, notifySuccess, runSuccess, updateMutate],
  );

  const pauseMailboxSender = useCallback(
    async (
      campaignId: string,
      senderId: string,
      mailboxLabel: string,
      options?: PauseCampaignMailboxSenderInput,
    ) => {
      try {
        await pauseMutate({ campaignId, senderId, payload: options });
        if (options?.pauseCampaign && options.pausedUntil) {
          notifySuccess(
            `Paused ${mailboxLabel} and the campaign until ${formatPauseDate(options.pausedUntil)}`,
          );
        } else {
          notifySuccess(`Paused ${mailboxLabel} for this campaign`);
        }
        await runSuccess();
      } catch (error) {
        notifyError(
          getApiErrorMessage(error, `Failed to pause ${mailboxLabel}`),
        );
      }
    },
    [notifyError, notifySuccess, pauseMutate, runSuccess],
  );

  const stopMailboxSender = useCallback(
    async (
      campaignId: string,
      senderId: string,
      mailboxLabel: string,
      options?: StopCampaignMailboxSenderInput,
    ) => {
      try {
        await stopMutate({ campaignId, senderId, payload: options });
        if (options?.pauseCampaign) {
          notifySuccess(`Stopped ${mailboxLabel} and paused the campaign`);
        } else {
          notifySuccess(`Stopped ${mailboxLabel} for this campaign`);
        }
        await runSuccess();
      } catch (error) {
        notifyError(
          getApiErrorMessage(error, `Failed to stop ${mailboxLabel}`),
        );
      }
    },
    [notifyError, notifySuccess, runSuccess, stopMutate],
  );

  const resumeMailboxSender = useCallback(
    async (campaignId: string, senderId: string, mailboxLabel: string) => {
      try {
        await resumeMutate({ campaignId, senderId });
        notifySuccess(`Resumed ${mailboxLabel} in this campaign`);
        await runSuccess();
      } catch (error) {
        notifyError(
          getApiErrorMessage(error, `Failed to resume ${mailboxLabel}`),
        );
      }
    },
    [notifyError, notifySuccess, resumeMutate, runSuccess],
  );

  return useMemo(
    () => ({
      addMailboxSender,
      updateMailboxSender,
      pauseMailboxSender,
      stopMailboxSender,
      resumeMailboxSender,
      isUpdating:
        isAdding || isUpdatingSender || isPausing || isStopping || isResuming,
    }),
    [
      addMailboxSender,
      isAdding,
      isPausing,
      isResuming,
      isStopping,
      isUpdatingSender,
      pauseMailboxSender,
      resumeMailboxSender,
      stopMailboxSender,
      updateMailboxSender,
    ],
  );
}

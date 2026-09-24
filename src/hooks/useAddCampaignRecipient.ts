'use client';

import { useCallback, useMemo } from 'react';
import { emailCampaignService } from '@/lib/api';
import type { AddCampaignRecipientInput } from '@/lib/email/campaigns/recipient-types';
import { useApiMutation } from '@/hooks/api';
import { useNotify } from '@/hooks/useNotify';

export function useAddCampaignRecipient(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const { notifyError, notifySuccess } = useNotify();

  const { mutate, isLoading } = useApiMutation(
    (input: { campaignId: string; recipient: AddCampaignRecipientInput }) =>
      emailCampaignService.addRecipient(input.campaignId, input.recipient),
  );

  const onSuccess = options?.onSuccess;

  const addRecipient = useCallback(
    async (campaignId: string, recipient: AddCampaignRecipientInput) => {
      try {
        await mutate({ campaignId, recipient });
        notifySuccess(`${recipient.email} added to campaign`);
        if (onSuccess) {
          await onSuccess();
        }
      } catch {
        notifyError(`Failed to add ${recipient.email} to campaign`);
        throw new Error('Failed to add recipient');
      }
    },
    [mutate, notifyError, notifySuccess, onSuccess],
  );

  return useMemo(
    () => ({
      addRecipient,
      isAdding: isLoading,
    }),
    [addRecipient, isLoading],
  );
}

'use client';

import { useCallback, useMemo } from 'react';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import {
  buildMailboxLockMap,
  getMailboxLockReason,
} from '@/lib/email/campaigns/mailbox-campaign-lock';

export function useMailboxCampaignLocks(excludeCampaignId?: string) {
  const { campaigns, isLoading } = useEmailCampaigns();

  const lockMap = useMemo(
    () => buildMailboxLockMap(campaigns, excludeCampaignId),
    [campaigns, excludeCampaignId],
  );

  const getLockReason = useCallback(
    (mailboxId: string, mailboxLabel?: string) =>
      getMailboxLockReason(mailboxId, lockMap, mailboxLabel),
    [lockMap],
  );

  const isMailboxLocked = useCallback(
    (mailboxId: string) => lockMap.has(mailboxId),
    [lockMap],
  );

  return {
    lockMap,
    getLockReason,
    isMailboxLocked,
    isLoading,
  };
}

'use client';

import CampaignActivityFeed from '@/components/email/campaigns/detail/activity/CampaignActivityFeed';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface ActivityTabProps {
  campaignId: string;
  campaignStatus: EmailCampaignStatus;
}

export default function ActivityTab({
  campaignId,
  campaignStatus,
}: ActivityTabProps) {
  return (
    <CampaignActivityFeed
      campaignId={campaignId}
      campaignStatus={campaignStatus}
    />
  );
}

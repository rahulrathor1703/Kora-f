'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import AdvancedTab from '@/components/email/mailboxes/detail/tabs/AdvancedTab';
import CampaignsTab from '@/components/email/mailboxes/detail/tabs/CampaignsTab';
import OverviewTab from '@/components/email/mailboxes/detail/tabs/OverviewTab';
import type {
  MailboxCampaignsResponse,
  SenderMailboxDetail,
} from '@/lib/email/mailbox-types';

type DetailTab = 'overview' | 'campaigns' | 'advanced';

interface MailboxDetailTabsProps {
  mailbox: SenderMailboxDetail;
  campaignsData: MailboxCampaignsResponse | null;
  isCampaignsLoading: boolean;
}

export default function MailboxDetailTabs({
  mailbox,
  campaignsData,
  isCampaignsLoading,
}: MailboxDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const campaignCount = campaignsData?.campaigns.length ?? 0;

  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'campaigns',
      label: isCampaignsLoading
        ? 'Campaigns'
        : `Campaigns (${campaignCount.toLocaleString()})`,
    },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_event, value: DetailTab) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        className="mb-4 border-b border-surface-border"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            className="min-h-12 font-semibold normal-case"
          />
        ))}
      </Tabs>

      <Box role="tabpanel">
        {activeTab === 'overview' ? (
          <OverviewTab
            mailbox={mailbox}
            campaignsData={campaignsData}
            isCampaignsLoading={isCampaignsLoading}
          />
        ) : null}
        {activeTab === 'campaigns' ? (
          <CampaignsTab
            campaignsData={campaignsData}
            isLoading={isCampaignsLoading}
          />
        ) : null}
        {activeTab === 'advanced' ? <AdvancedTab mailbox={mailbox} /> : null}
      </Box>
    </Box>
  );
}

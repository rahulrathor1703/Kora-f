'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import OverviewTab from '@/components/email/campaigns/detail/tabs/OverviewTab';
import AdvancedTab from '@/components/email/campaigns/detail/tabs/AdvancedTab';
import MailboxesTab from '@/components/email/campaigns/detail/tabs/MailboxesTab';
import ActivityTab from '@/components/email/campaigns/detail/tabs/ActivityTab';
import ContactsTab from '@/components/email/campaigns/detail/tabs/ContactsTab';
import SequenceTab from '@/components/email/campaigns/detail/tabs/SequenceTab';
import AiPlusTab from '@/components/email/campaigns/detail/tabs/AiPlusTab';
import type { CampaignAdvancedFieldValues } from '@/components/email/campaigns/shared/CampaignAdvancedFieldsDrawer';
import { canManageCampaignMailboxes } from '@/lib/email/campaigns/mailbox-sender-utils';
import type { EmailCampaign } from '@/lib/email/campaigns/types';
import type { CampaignDetailLabels } from '@/hooks/useCampaignDetailLabels';

type DetailTab =
  | 'overview'
  | 'activity'
  | 'contacts'
  | 'ai-plus'
  | 'sequence'
  | 'mailboxes'
  | 'advanced';

interface CampaignDetailTabsProps {
  campaign: EmailCampaign;
  labels: CampaignDetailLabels;
  canUpdate?: boolean;
  advancedInitialValues?: CampaignAdvancedFieldValues;
  onSaveAdvanced?: (values: CampaignAdvancedFieldValues) => Promise<void>;
  isSavingAdvanced?: boolean;
  canDirectDelete?: boolean;
  canRequestDelete?: boolean;
  hasPendingDeleteRequest?: boolean;
  pendingDeleteRequestLabel?: string;
  onDirectDelete?: () => void;
  onRequestDelete?: () => void;
  isDeleting?: boolean;
}

export default function CampaignDetailTabs({
  campaign,
  labels,
  canUpdate = false,
  advancedInitialValues,
  onSaveAdvanced,
  isSavingAdvanced = false,
  canDirectDelete = false,
  canRequestDelete = false,
  hasPendingDeleteRequest = false,
  pendingDeleteRequestLabel,
  onDirectDelete,
  onRequestDelete,
  isDeleting = false,
}: CampaignDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const showMailboxesTab = canManageCampaignMailboxes(campaign.status);
  const showAdvancedTab =
    (canUpdate && advancedInitialValues && onSaveAdvanced) ||
    (canDirectDelete && onDirectDelete) ||
    (canRequestDelete && onRequestDelete);

  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'contacts',
      label: `Contacts (${campaign.audienceCount.toLocaleString()})`,
    },
    ...(showMailboxesTab
      ? [
          {
            id: 'mailboxes' as const,
            label: `Mailboxes (${campaign.mailboxSenders.length})`,
          },
        ]
      : []),
    { id: 'sequence', label: 'Sequence' },
    { id: 'activity', label: 'Activity' },
    { id: 'ai-plus', label: 'AI Plus' },
    ...(showAdvancedTab ? [{ id: 'advanced' as const, label: 'Advanced' }] : []),
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
          <OverviewTab campaign={campaign} />
        ) : null}
        {activeTab === 'activity' ? (
          <ActivityTab
            campaignId={campaign.id}
            campaignStatus={campaign.status}
          />
        ) : null}
        {activeTab === 'contacts' ? (
          <ContactsTab campaign={campaign} labels={labels} />
        ) : null}
        {activeTab === 'mailboxes' && showMailboxesTab ? (
          <MailboxesTab campaign={campaign} />
        ) : null}
        {activeTab === 'ai-plus' ? <AiPlusTab campaign={campaign} /> : null}
        {activeTab === 'sequence' ? (
          <SequenceTab campaign={campaign} />
        ) : null}
        {activeTab === 'advanced' && showAdvancedTab ? (
          <AdvancedTab
            key={campaign.updatedAt}
            canUpdate={canUpdate}
            initialValues={advancedInitialValues}
            onSave={onSaveAdvanced}
            isSaving={isSavingAdvanced}
            canDirectDelete={canDirectDelete}
            canRequestDelete={canRequestDelete}
            hasPendingDeleteRequest={hasPendingDeleteRequest}
            pendingDeleteRequestLabel={pendingDeleteRequestLabel}
            onDirectDelete={onDirectDelete}
            onRequestDelete={onRequestDelete}
            isDeleting={isDeleting}
          />
        ) : null}
      </Box>
    </Box>
  );
}

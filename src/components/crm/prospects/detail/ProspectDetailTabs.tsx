'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import ProspectComingSoonTab from '@/components/crm/prospects/detail/ProspectComingSoonTab';
import ProspectBantTab from '@/components/crm/prospects/detail/ProspectBantTab';
import ProspectCampaignTab from '@/components/crm/prospects/detail/ProspectCampaignTab';
import ProspectEngagementTab from '@/components/crm/prospects/detail/ProspectEngagementTab';
import ProspectOverviewTab from '@/components/crm/prospects/detail/ProspectOverviewTab';
import type {
  Prospect,
  ProspectFieldDefinition,
} from '@/lib/crm/prospects/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';

type ProspectDetailTab =
  | 'overview'
  | 'company'
  | 'campaign'
  | 'replies'
  | 'engagement'
  | 'bant'
  | 'ai-assistant';

interface ProspectDetailTabsProps {
  prospect: Prospect;
  fields: ProspectFieldDefinition[];
  canUpdate: boolean;
  isSaving: boolean;
  engagementsRefreshToken: number;
  onEngagementLogged: () => void;
  onBantSaved: () => void;
  onSave: (values: Record<string, FieldStoredValue>) => Promise<void>;
}

const TABS: Array<{ id: ProspectDetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'company', label: 'Company' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'replies', label: 'Replies' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'bant', label: 'BANT' },
  { id: 'ai-assistant', label: 'AI Assistant' },
];

export default function ProspectDetailTabs({
  prospect,
  fields,
  canUpdate,
  isSaving,
  engagementsRefreshToken,
  onEngagementLogged,
  onBantSaved,
  onSave,
}: ProspectDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ProspectDetailTab>('overview');

  const activeLabel =
    TABS.find((tab) => tab.id === activeTab)?.label ?? 'Overview';

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_event, value: ProspectDetailTab) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        className="mb-4 border-b border-surface-border"
      >
        {TABS.map((tab) => (
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
          <Card className="dashboard-panel rounded-2xl shadow-none">
            <CardContent className="p-6">
              <ProspectOverviewTab
                key={`${prospect.id}-${prospect.updatedAt}`}
                prospect={prospect}
                fields={fields}
                canUpdate={canUpdate}
                isSaving={isSaving}
                onSave={onSave}
              />
            </CardContent>
          </Card>
        ) : activeTab === 'campaign' ? (
          <ProspectCampaignTab prospect={prospect} />
        ) : activeTab === 'engagement' ? (
          <ProspectEngagementTab
            prospect={prospect}
            fields={fields}
            canUpdate={canUpdate}
            refreshToken={engagementsRefreshToken}
            onEngagementLogged={onEngagementLogged}
          />
        ) : activeTab === 'bant' ? (
          <Card className="dashboard-panel rounded-2xl shadow-none">
            <CardContent className="p-6">
              <ProspectBantTab
                prospectId={prospect.id}
                canUpdate={canUpdate}
                onSaved={onBantSaved}
              />
            </CardContent>
          </Card>
        ) : (
          <ProspectComingSoonTab tabLabel={activeLabel} />
        )}
      </Box>
    </Box>
  );
}

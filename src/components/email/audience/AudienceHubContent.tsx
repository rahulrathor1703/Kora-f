'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import AllContactsPanel from '@/components/email/audience/AllContactsPanel';
import ExcludedContent from '@/components/email/excluded/ExcludedContent';
import ListsContent from '@/components/email/lists/ListsContent';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  AUDIENCE_HUB_TAB_QUERY_KEY,
  buildAudienceHubSearchParams,
  parseAudienceHubTab,
  type AudienceHubTab,
} from '@/lib/email/audience-tabs';

export default function AudienceHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toOrgPath = useOrgPath();
  const activeTab = parseAudienceHubTab(searchParams.get(AUDIENCE_HUB_TAB_QUERY_KEY));

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, value: AudienceHubTab) => {
      const nextParams = buildAudienceHubSearchParams(value, searchParams);

      if (value !== 'lists') {
        nextParams.delete('imported');
        nextParams.delete('skipped');
        nextParams.delete('manual');
      }

      const query = nextParams.toString();
      router.replace(toOrgPath(`/email/lists${query ? `?${query}` : ''}`));
    },
    [router, searchParams, toOrgPath],
  );

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minHeight: 48 }}
        className="mb-4 min-w-0 border-b border-surface-border"
      >
        <Tab
          value="contacts"
          label="Contacts"
          className="min-h-12 font-semibold normal-case"
        />
        <Tab
          value="lists"
          label="Lists"
          className="min-h-12 font-semibold normal-case"
        />
        <Tab
          value="excluded"
          label="Excluded"
          className="min-h-12 font-semibold normal-case"
        />
      </Tabs>

      <Box role="tabpanel">
        {activeTab === 'contacts' ? (
          <AllContactsPanel enabled={activeTab === 'contacts'} />
        ) : null}
        {activeTab === 'lists' ? <ListsContent /> : null}
        {activeTab === 'excluded' ? <ExcludedContent /> : null}
      </Box>
    </Box>
  );
}

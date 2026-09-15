'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import AudienceHubContent from '@/components/email/audience/AudienceHubContent';
import EmailHubShell from '@/components/email/EmailHubShell';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  AUDIENCE_HUB_TAB_QUERY_KEY,
  isAudienceHubListsTab,
  parseAudienceHubTab,
} from '@/lib/email/audience-tabs';

export default function ListsPage() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const searchParams = useSearchParams();
  const canCreateManualList = useHasPermission('manual-lists:create');
  const canCreateContactList = useHasPermission('contact-lists:create');
  const activeTab = parseAudienceHubTab(searchParams.get(AUDIENCE_HUB_TAB_QUERY_KEY));
  const showListsTabContent = isAudienceHubListsTab(activeTab);

  const importSuccessMessage = useMemo(() => {
    if (!showListsTabContent) {
      return null;
    }

    const imported = searchParams.get('imported');
    if (!imported) {
      return null;
    }

    const skipped = searchParams.get('skipped');
    const importedCount = Number(imported);
    const skippedCount = skipped ? Number(skipped) : 0;

    if (Number.isNaN(importedCount)) {
      return null;
    }

    return (
      `Imported ${importedCount.toLocaleString()} contacts` +
      (skippedCount > 0
        ? ` (${skippedCount.toLocaleString()} rows skipped)`
        : '')
    );
  }, [searchParams, showListsTabContent]);

  const manualListSuccessMessage = useMemo(() => {
    if (!showListsTabContent || searchParams.get('manual') !== 'created') {
      return null;
    }

    return 'Manual list created successfully.';
  }, [searchParams, showListsTabContent]);

  return (
    <EmailHubShell
      actions={
        showListsTabContent ? (
          <Stack direction="row" spacing={1.5} className="shrink-0">
            {canCreateManualList ? (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  router.push(toOrgPath('/email/lists/new/manual'))
                }
                className="rounded-2xl px-5 py-2.5"
              >
                Add manual list
              </Button>
            ) : null}
            {canCreateContactList ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push(toOrgPath('/email/lists/new'))}
                className="rounded-2xl px-5 py-2.5 shadow-primary-soft"
              >
                Add list
              </Button>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {importSuccessMessage ? (
        <Alert severity="success" className="mb-3 rounded-2xl">
          {importSuccessMessage}
        </Alert>
      ) : null}
      {manualListSuccessMessage ? (
        <Alert severity="success" className="mb-3 rounded-2xl">
          {manualListSuccessMessage}
        </Alert>
      ) : null}
      <AudienceHubContent />
    </EmailHubShell>
  );
}

'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useState } from 'react';
import CrmBulkImportDialog from '@/components/crm/import/CrmBulkImportDialog';
import CrmHubShell from '@/components/crm/CrmHubShell';
import { PipelineBoardSection } from '@/components/crm/pipeline/PipelineBoardSection';
import { ProspectPipelineViewProvider, useProspectPipelineView } from '@/components/crm/ProspectPipelineViewContext';
import { ProspectusHeaderActions } from '@/components/crm/prospectus/ProspectusHeaderActions';
import { ProspectusListSection } from '@/components/crm/prospectus/ProspectusListSection';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { ProspectPipelineView } from '@/lib/crm/prospect-pipeline-view';

interface ProspectsHubContentProps {
  defaultView: ProspectPipelineView;
}

function ProspectsHubInner() {
  const canRead = useHasPermission('prospects:read');
  const { view, isViewMounted } = useProspectPipelineView();
  const [logEngagementOpen, setLogEngagementOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const detailFrom = view === '/crm/pipeline' ? 'pipeline' : 'prospectus';

  if (!canRead) {
    return (
      <CrmHubShell>
        <Alert severity="warning">
          You do not have permission to view prospects.
        </Alert>
      </CrmHubShell>
    );
  }

  return (
    <CrmHubShell
      actions={
        <ProspectusHeaderActions
          onLogEngagementClick={() => setLogEngagementOpen(true)}
          onBulkUploadClick={() => setBulkImportOpen(true)}
        />
      }
    >
      <Box className="flex min-h-0 w-full flex-1 flex-col">
        {isViewMounted('/crm/prospectus') ? (
          <Box hidden={view !== '/crm/prospectus'}>
            <ProspectusListSection
              detailFrom={detailFrom}
              logEngagementOpen={logEngagementOpen}
              onLogEngagementOpenChange={setLogEngagementOpen}
              refreshKey={listRefreshKey}
            />
          </Box>
        ) : null}

        {isViewMounted('/crm/pipeline') ? (
          <Box
            hidden={view !== '/crm/pipeline'}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            <PipelineBoardSection />
          </Box>
        ) : null}
      </Box>

      <CrmBulkImportDialog
        open={bulkImportOpen}
        defaultEntityType="prospect"
        onClose={() => setBulkImportOpen(false)}
        onSuccess={() => setListRefreshKey((current) => current + 1)}
      />
    </CrmHubShell>
  );
}

export default function ProspectsHubContent({
  defaultView,
}: ProspectsHubContentProps) {
  return (
    <ProspectPipelineViewProvider defaultView={defaultView}>
      <ProspectsHubInner />
    </ProspectPipelineViewProvider>
  );
}

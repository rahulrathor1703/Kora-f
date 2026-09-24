'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import LogEngagementDialog from '@/components/crm/prospects/LogEngagementDialog';
import RequestProspectDeleteDialog from '@/components/crm/prospects/RequestProspectDeleteDialog';
import ProspectsTable from '@/components/crm/prospects/ProspectsTable';
import ProspectsToolbar from '@/components/crm/prospects/ProspectsToolbar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useProspectFieldSchema,
  useProspectMutations,
  useProspects,
} from '@/hooks/useProspects';
import { useProspectDeleteRequests } from '@/hooks/useProspectDeleteRequests';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useSession } from '@/hooks/useAuth';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import { splitFilterableFields } from '@/lib/crm/prospects/filter-config';
import type { CreateProspectEngagementInput } from '@/lib/crm/prospects/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import type { Prospect } from '@/lib/crm/prospects/types';

interface ProspectusListSectionProps {
  detailFrom?: 'prospectus' | 'pipeline';
  logEngagementOpen: boolean;
  onLogEngagementOpenChange: (open: boolean) => void;
  refreshKey?: number;
}

export function ProspectusListSection({
  detailFrom = 'prospectus',
  logEngagementOpen,
  onLogEngagementOpenChange,
  refreshKey = 0,
}: ProspectusListSectionProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canUpdate = useHasPermission('prospects:update');
  const canRequestDelete = useHasPermission('prospects:request-delete');
  const canDirectDelete = useHasPermission('prospects:delete');
  const { data: session } = useSession();
  const requesterDisplayName =
    session?.username?.trim() || session?.email || 'You';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [deleteRequestTarget, setDeleteRequestTarget] = useState<Prospect | null>(
    null,
  );
  const [directDeleteTarget, setDirectDeleteTarget] = useState<Prospect | null>(
    null,
  );
  const [savingCell, setSavingCell] = useState<{
    prospectId: string;
    fieldKey: string;
  } | null>(null);

  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useProspectFieldSchema();

  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim().length > 0),
      ),
    [filters],
  );

  const {
    data: prospectsPage,
    isLoading: isProspectsLoading,
    refetch: refetchProspects,
  } = useProspects({
    q: search,
    page,
    pageSize,
    filters: activeFilters,
  });

  useEffect(() => {
    if (refreshKey > 0) {
      void refetchProspects();
    }
  }, [refreshKey, refetchProspects]);

  const {
    createEngagement,
    updateProspect,
    deleteProspect,
    isLoggingEngagement,
    isDeletingProspect,
  } = useProspectMutations();

  const {
    requests: pendingDeleteRequests,
    createDeleteRequest,
    isCreating: isCreatingDeleteRequest,
    refetch: refetchDeleteRequests,
  } = useProspectDeleteRequests({ status: 'pending' });

  const pendingDeleteRequestProspectIds = useMemo(
    () =>
      new Set(
        pendingDeleteRequests
          .map((request) => request.prospectId)
          .filter((prospectId): prospectId is string => Boolean(prospectId)),
      ),
    [pendingDeleteRequests],
  );

  const fields = useMemo(() => fieldSchema?.fields ?? [], [fieldSchema]);
  const { primary: primaryFields, secondary: secondaryFields } = useMemo(
    () => splitFilterableFields(fields),
    [fields],
  );

  async function handleLogEngagement(
    prospectId: string,
    input: CreateProspectEngagementInput,
  ) {
    try {
      await createEngagement(prospectId, input);
      onLogEngagementOpenChange(false);
      notifySuccess('Engagement logged');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to log engagement'));
    }
  }

  async function handleFieldUpdate(
    prospectId: string,
    key: string,
    value: FieldStoredValue,
  ) {
    setSavingCell({ prospectId, fieldKey: key });

    try {
      await updateProspect(prospectId, { values: { [key]: value } });
      await refetchProspects();
      notifySuccess('Prospect updated');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to update prospect'));
    } finally {
      setSavingCell(null);
    }
  }

  async function handleCreateDeleteRequest(reason: string) {
    if (!deleteRequestTarget) {
      return;
    }

    try {
      await createDeleteRequest({
        prospectId: deleteRequestTarget.id,
        reason,
      });
      await refetchDeleteRequests();
      notifySuccess('Delete request submitted');
      setDeleteRequestTarget(null);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to submit delete request'));
      throw error;
    }
  }

  async function handleDirectDeleteConfirm() {
    if (!directDeleteTarget) {
      return;
    }

    try {
      await deleteProspect(directDeleteTarget.id);
      await refetchProspects();
      await refetchDeleteRequests();
      notifySuccess('Prospect deleted');
      setDirectDeleteTarget(null);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to delete prospect'));
    }
  }

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {prospectsPage
            ? `${prospectsPage.total} prospect${prospectsPage.total === 1 ? '' : 's'} loaded`
            : 'Loading prospects...'}
        </Typography>

        <ProspectsToolbar
          search={search}
          filters={filters}
          primaryFields={primaryFields}
          secondaryFields={secondaryFields}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onFilterChange={(key, value) => {
            setFilters((current) => {
              const next = { ...current };

              if (!value.trim()) {
                delete next[key];
                return next;
              }

              next[key] = value;
              return next;
            });
            setPage(1);
          }}
          onClearAllFilters={() => {
            setFilters({});
            setPage(1);
          }}
        />

        <ProspectsTable
          prospects={prospectsPage?.items ?? []}
          fields={fields}
          isLoading={isSchemaLoading || isProspectsLoading}
          total={prospectsPage?.total ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
          canUpdate={canUpdate}
          savingCell={savingCell}
          onFieldUpdate={handleFieldUpdate}
          canRequestDelete={canRequestDelete}
          canDirectDelete={canDirectDelete}
          pendingDeleteRequestProspectIds={pendingDeleteRequestProspectIds}
          onRequestDelete={setDeleteRequestTarget}
          onDirectDelete={setDirectDeleteTarget}
          onRowClick={(row) =>
            router.push(
              toOrgPath(`/crm/prospects/${row.id}?from=${detailFrom}`),
            )
          }
        />
      </Stack>

      {logEngagementOpen ? (
        <LogEngagementDialog
          open
          isSubmitting={isLoggingEngagement}
          onClose={() => onLogEngagementOpenChange(false)}
          onSubmit={handleLogEngagement}
        />
      ) : null}

      {deleteRequestTarget ? (
        <RequestProspectDeleteDialog
          open
          prospectName={deleteRequestTarget.fullName}
          requesterName={requesterDisplayName}
          isSubmitting={isCreatingDeleteRequest}
          onClose={() => setDeleteRequestTarget(null)}
          onSubmit={handleCreateDeleteRequest}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(directDeleteTarget)}
        onClose={() => setDirectDeleteTarget(null)}
        onConfirm={() => void handleDirectDeleteConfirm()}
        variant="destructive"
        title="Delete prospect"
        description={
          <>
            Permanently delete{' '}
            <strong>{directDeleteTarget?.fullName || 'this prospect'}</strong>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeletingProspect}
      />
    </>
  );
}

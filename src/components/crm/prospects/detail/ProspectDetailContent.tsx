'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProspectDetailHeader from '@/components/crm/prospects/detail/ProspectDetailHeader';
import ProspectDetailTabs from '@/components/crm/prospects/detail/ProspectDetailTabs';
import RequestProspectDeleteDialog from '@/components/crm/prospects/RequestProspectDeleteDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useSession } from '@/hooks/useAuth';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  useProspect,
  useProspectFieldSchema,
  useProspectMutations,
} from '@/hooks/useProspects';
import { useProspectDeleteRequests } from '@/hooks/useProspectDeleteRequests';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { getApiErrorMessage } from '@/lib/api';
import {
  getProspectDetailBackHref,
  type ProspectDetailFrom,
} from '@/lib/crm/prospects/detail-config';

interface ProspectDetailContentProps {
  prospectId: string;
}

function parseFromParam(value: string | null): ProspectDetailFrom | null {
  if (value === 'pipeline' || value === 'prospectus') {
    return value;
  }

  return null;
}

export default function ProspectDetailContent({
  prospectId,
}: ProspectDetailContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const searchParams = useSearchParams();
  const from = parseFromParam(searchParams.get('from'));
  const { notifyError, notifySuccess } = useNotify();
  const canUpdate = useHasPermission('prospects:update');
  const canRequestDelete = useHasPermission('prospects:request-delete');
  const canDirectDelete = useHasPermission('prospects:delete');
  const { data: session } = useSession();
  const requesterDisplayName =
    session?.username?.trim() || session?.email || 'You';
  const [deleteRequestOpen, setDeleteRequestOpen] = useState(false);
  const [directDeleteOpen, setDirectDeleteOpen] = useState(false);
  const [engagementsRefreshToken, setEngagementsRefreshToken] = useState(0);

  const {
    data: prospect,
    error,
    isLoading,
    refetch,
  } = useProspect(prospectId);
  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useProspectFieldSchema();
  const {
    updateProspect,
    deleteProspect,
    isUpdatingProspect,
    isDeletingProspect,
  } = useProspectMutations();
  const {
    requests: pendingDeleteRequests,
    createDeleteRequest,
    isCreating: isCreatingDeleteRequest,
    refetch: refetchDeleteRequests,
  } = useProspectDeleteRequests({ status: 'pending', prospectId });

  const hasPendingDeleteRequest = useMemo(
    () => pendingDeleteRequests.some((request) => request.status === 'pending'),
    [pendingDeleteRequests],
  );

  const pendingDeleteRequest = useMemo(
    () =>
      pendingDeleteRequests.find((request) => request.status === 'pending') ??
      null,
    [pendingDeleteRequests],
  );

  async function handleSave(values: Record<string, FieldStoredValue>) {
    try {
      await updateProspect(prospectId, { values });
      notifySuccess('Prospect updated');
      await refetch();
      setEngagementsRefreshToken((current) => current + 1);
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Failed to save prospect'));
      throw saveError;
    }
  }

  function handleEngagementLogged() {
    setEngagementsRefreshToken((current) => current + 1);
  }

  async function handleCreateDeleteRequest(reason: string) {
    try {
      await createDeleteRequest({ prospectId, reason });
      await refetchDeleteRequests();
      notifySuccess('Delete request submitted');
      setDeleteRequestOpen(false);
    } catch (saveError) {
      notifyError(
        getApiErrorMessage(saveError, 'Unable to submit delete request'),
      );
      throw saveError;
    }
  }

  async function handleDirectDeleteConfirm() {
    try {
      await deleteProspect(prospectId);
      notifySuccess('Prospect deleted');
      router.push(toOrgPath(getProspectDetailBackHref(from)));
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to delete prospect'));
    }
  }

  if (error && !isLoading) {
    return (
      <Stack spacing={3}>
        <ProspectDetailHeader prospect={null} from={from} isLoading={false} />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              Prospect not found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              This prospect may have been removed or you may not have access to
              view it.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  const fields = fieldSchema?.fields ?? [];

  return (
    <Stack spacing={3}>
      <ProspectDetailHeader
        prospect={prospect ?? null}
        from={from}
        isLoading={isLoading || isSchemaLoading}
      />

      {prospect && (canRequestDelete || canDirectDelete) ? (
        <Stack direction="row" spacing={1} className="flex-wrap items-center">
          {hasPendingDeleteRequest ? (
            <Chip
              size="small"
              label={
                pendingDeleteRequest?.requestedByName
                  ? `Delete request pending — raised by ${pendingDeleteRequest.requestedByName}`
                  : 'Delete request pending'
              }
              color="warning"
              variant="outlined"
            />
          ) : null}
          {canDirectDelete ? (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDirectDeleteOpen(true)}
            >
              Delete
            </Button>
          ) : null}
          {canRequestDelete ? (
            <Button
              variant="outlined"
              color="error"
              disabled={hasPendingDeleteRequest}
              onClick={() => setDeleteRequestOpen(true)}
            >
              Request delete
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {prospect ? (
        <ProspectDetailTabs
          prospect={prospect}
          fields={fields}
          canUpdate={canUpdate}
          isSaving={isUpdatingProspect}
          engagementsRefreshToken={engagementsRefreshToken}
          onEngagementLogged={handleEngagementLogged}
          onBantSaved={() => void refetch()}
          onSave={handleSave}
        />
      ) : isLoading || isSchemaLoading ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-6">
            <Typography variant="body2" color="text.secondary">
              Loading prospect details…
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {deleteRequestOpen && prospect ? (
        <RequestProspectDeleteDialog
          open
          prospectName={prospect.fullName}
          requesterName={requesterDisplayName}
          isSubmitting={isCreatingDeleteRequest}
          onClose={() => setDeleteRequestOpen(false)}
          onSubmit={handleCreateDeleteRequest}
        />
      ) : null}

      <ConfirmDialog
        open={directDeleteOpen}
        onClose={() => setDirectDeleteOpen(false)}
        onConfirm={() => void handleDirectDeleteConfirm()}
        variant="destructive"
        title="Delete prospect"
        description={
          <>
            Permanently delete{' '}
            <strong>{prospect?.fullName || 'this prospect'}</strong>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeletingProspect}
      />
    </Stack>
  );
}

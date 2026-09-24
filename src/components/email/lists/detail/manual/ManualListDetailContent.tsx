'use client';

import AddIcon from '@mui/icons-material/Add';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import ListCampaignsSection from '@/components/email/lists/detail/ListCampaignsSection';
import ListDetailHeader from '@/components/email/lists/detail/ListDetailHeader';
import ListDetailShell from '@/components/email/lists/detail/ListDetailShell';
import ListMetricsBar from '@/components/email/lists/detail/ListMetricsBar';
import AddManualRowDialog, {
  type AddManualRowSubmitOptions,
} from '@/components/email/lists/detail/manual/AddManualRowDialog';
import AppendManualImportDialog from '@/components/email/lists/detail/manual/AppendManualImportDialog';
import ManualListRowsTable from '@/components/email/lists/detail/manual/ManualListRowsTable';
import PushMembersToCampaignsDialog from '@/components/email/lists/detail/shared/PushMembersToCampaignsDialog';
import RemoveListMemberDialog from '@/components/email/lists/detail/shared/RemoveListMemberDialog';
import {
  useManualListDetail,
  useManualListMutations,
} from '@/hooks/useManualLists';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import {
  formatPushMemberCountLabel,
  hasPushEligibleCampaigns,
} from '@/lib/email/lists/campaign-sync-utils';
import type { ListCampaignRemovalAction } from '@/lib/email/lists/detail-types';
import type { ManualListRow } from '@/lib/lists/types';

interface ManualListDetailContentProps {
  listId: string;
}

interface PushDialogState {
  rowIds: string[];
  count: number;
}

interface RemoveDialogState {
  rowId: string;
  emailLabel: string;
}

function resolveManualRowEmail(
  row: ManualListRow,
  columns: Array<{ key: string; label: string }>,
): string | null {
  const emailColumn = columns.find(
    (column) =>
      /^email$/i.test(column.key) || /^email$/i.test(column.label),
  );

  if (emailColumn) {
    const candidate = row.values[emailColumn.key]?.trim().toLowerCase();
    if (candidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
      return candidate;
    }
  }

  for (const value of Object.values(row.values)) {
    const candidate = value?.trim().toLowerCase();
    if (candidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getManualRowLabel(
  row: ManualListRow,
  columns: Array<{ key: string; label: string }>,
): string {
  return resolveManualRowEmail(row, columns) ?? `row ${row.rowIndex + 1}`;
}

export default function ManualListDetailContent({
  listId,
}: ManualListDetailContentProps) {
  const canUpdate = useHasPermission('manual-lists:update');
  const canUpdateCampaigns = useHasPermission('email-campaigns:update');
  const { notifySuccess, notifyError } = useNotify();
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pushDialog, setPushDialog] = useState<PushDialogState | null>(null);
  const [removeDialog, setRemoveDialog] = useState<RemoveDialogState | null>(
    null,
  );

  const {
    data: list,
    error: listError,
    isLoading,
    refetch,
  } = useManualListDetail(listId);

  const {
    addRow,
    removeRow,
    enrollRowsInCampaigns,
    isAddingRow,
    isAppendingImport,
    isRemovingRow,
    isEnrollingRows,
  } = useManualListMutations(listId);

  const canPushToCampaigns =
    canUpdate &&
    canUpdateCampaigns &&
    hasPushEligibleCampaigns(list?.campaigns ?? []);

  function openPushDialog(rowIds: string[]) {
    if (rowIds.length === 0 || !canPushToCampaigns) {
      return;
    }

    setPushDialog({ rowIds, count: rowIds.length });
  }

  function maybeOpenPushDialog(rowIds: string[]) {
    openPushDialog(rowIds);
  }

  async function handleAddRow(
    values: Record<string, string>,
    options?: AddManualRowSubmitOptions,
  ) {
    setActionError(null);

    try {
      const row = await addRow({ values });
      setAddOpen(false);
      await refetch();

      if (options?.pushToCampaigns) {
        openPushDialog([row.id]);
      } else {
        maybeOpenPushDialog([row.id]);
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Unable to add row'));
      throw error;
    }
  }

  function handlePushRowToCampaigns(row: ManualListRow) {
    openPushDialog([row.id]);
  }

  async function handleAppendComplete(result: {
    importedRowIds: string[];
    importedCount: number;
  }) {
    await refetch();

    if (result.importedCount > 0) {
      maybeOpenPushDialog(result.importedRowIds);
    }
  }

  function handleDeleteRow(row: ManualListRow) {
    if (!list) {
      return;
    }

    setRemoveDialog({
      rowId: row.id,
      emailLabel: getManualRowLabel(row, list.columns),
    });
  }

  async function handleConfirmRemove(campaignActions: ListCampaignRemovalAction[]) {
    if (!removeDialog) {
      return;
    }

    try {
      await removeRow({
        rowId: removeDialog.rowId,
        campaignActions,
      });
      setRemoveDialog(null);
      await refetch();
      notifySuccess('Row removed from list');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to remove row'));
    }
  }

  async function handleConfirmPush(campaignIds: string[]) {
    if (!pushDialog || campaignIds.length === 0) {
      setPushDialog(null);
      return;
    }

    try {
      const result = await enrollRowsInCampaigns({
        rowIds: pushDialog.rowIds,
        campaignIds,
      });
      setPushDialog(null);
      notifySuccess(
        `Added to ${result.addedCount} campaign${result.addedCount === 1 ? '' : 's'}${
          result.skippedCount > 0
            ? ` (${result.skippedCount} skipped)`
            : ''
        }`,
      );
      await refetch();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to add rows to campaigns'));
    }
  }

  if (listError) {
    return <ListDetailShell error={listError} />;
  }

  if (!isLoading && !list) {
    return <ListDetailShell notFound />;
  }

  return (
    <ListDetailShell>
      <ListDetailHeader name={list?.name ?? null} isLoading={isLoading} />

      <ListMetricsBar stats={list?.stats} isLoading={isLoading} />

      <ListCampaignsSection
        campaigns={list?.campaigns ?? []}
        isLoading={isLoading}
      />

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          {list ? (
            <ManualListRowsTable
              rows={list.rows}
              columns={list.columns}
              isLoading={isLoading}
              canDelete={canUpdate}
              canPushToCampaigns={canPushToCampaigns}
              onDeleteRow={handleDeleteRow}
              onPushToCampaigns={handlePushRowToCampaigns}
              getRowLabel={(row) => getManualRowLabel(row, list.columns)}
              toolbarLeadingContent={
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="h6" className="font-bold">
                    Rows
                  </Typography>
                  {canUpdate ? (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setAddOpen(true)}
                        className="rounded-xl"
                      >
                        Add row
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileOutlinedIcon />}
                        onClick={() => setBulkOpen(true)}
                        className="rounded-xl"
                      >
                        Bulk Upload
                      </Button>
                    </>
                  ) : null}
                </Stack>
              }
            />
          ) : null}
        </CardContent>
      </Card>

      {list ? (
        <>
          <AddManualRowDialog
            open={addOpen}
            columns={list.columns}
            isSubmitting={isAddingRow}
            canPushToCampaigns={canPushToCampaigns}
            error={actionError}
            onClose={() => {
              setAddOpen(false);
              setActionError(null);
            }}
            onSubmit={handleAddRow}
          />
          <AppendManualImportDialog
            open={bulkOpen}
            listId={listId}
            columns={list.columns}
            isSubmitting={isAppendingImport}
            onClose={() => setBulkOpen(false)}
            onComplete={handleAppendComplete}
          />
        </>
      ) : null}

      {removeDialog ? (
        <RemoveListMemberDialog
          open
          listType="manual"
          listId={listId}
          memberId={removeDialog.rowId}
          emailLabel={removeDialog.emailLabel}
          isSubmitting={isRemovingRow}
          onClose={() => setRemoveDialog(null)}
          onConfirm={handleConfirmRemove}
        />
      ) : null}

      {pushDialog ? (
        <PushMembersToCampaignsDialog
          open
          listType="manual"
          listId={listId}
          rowIds={pushDialog.rowIds}
          memberCountLabel={formatPushMemberCountLabel(pushDialog.count)}
          isSubmitting={isEnrollingRows}
          onClose={() => setPushDialog(null)}
          onConfirm={handleConfirmPush}
        />
      ) : null}
    </ListDetailShell>
  );
}

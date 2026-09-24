'use client';

import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import ColumnSettingsDialog, {
  ColumnSettingsButton,
} from '@/components/data-table/ColumnSettingsDialog';
import {
  DataTableFieldFiltersSection,
  DataTableFilterButton,
} from '@/components/data-table/DataTableFilterPanel';
import {
  buildFilterValueOptionsFromRows,
  filterTableRows,
  getActiveFieldFilters,
  isFieldFilterActive,
  type FieldFilter,
} from '@/components/data-table/filterTableRows';
import type { DataTableExternalToolbarState } from '@/components/data-table/types';
import { useTableColumns } from '@/components/data-table/useTableColumns';
import CampaignPipelineBoard from '@/components/email/campaigns/pipeline/CampaignPipelineBoard';
import CampaignRowActions from '@/components/email/campaigns/CampaignRowActions';
import RequestCampaignDeleteDialog from '@/components/email/campaigns/RequestCampaignDeleteDialog';
import CampaignStatusSelect from '@/components/email/campaigns/CampaignStatusSelect';
import CampaignsToolbar from '@/components/email/campaigns/pipeline/CampaignsToolbar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useCampaignIdFormat } from '@/hooks/useCampaignIdFormat';
import { useCampaignDeleteRequests } from '@/hooks/useCampaignDeleteRequests';
import { useCampaignListMetrics } from '@/hooks/useCampaignListMetrics';
import { useCampaignOverviewMetrics } from '@/hooks/useCampaignOverviewMetrics';
import { useContactLists } from '@/hooks/useContactLists';
import { useEmailCampaigns, useDeleteEmailCampaign } from '@/hooks/useEmailCampaigns';
import { useEmailConfigOptions } from '@/hooks/useEmailConfigOptions';
import { useManualLists } from '@/hooks/useManualLists';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import { formatMetricValue } from '@/lib/email/analytics/types';
import {
  buildCampaignPipelineBoardKey,
  CAMPAIGN_VIEW_MODE_STORAGE_KEY,
  filterCampaignsBySearch,
} from '@/lib/email/campaigns/pipeline-config';
import { getCampaignManualStatusChangeError } from '@/lib/email/campaigns/campaign-schedule-readiness';
import {
  buildCampaignColumnOverrides,
  buildCampaignPipelineCardColumnOverrides,
  buildCampaignTableColumnOverrides,
  CAMPAIGN_LIST_EXCLUDE_FIELDS,
  CAMPAIGN_LIST_INCLUDE_FIELDS,
  CAMPAIGN_LIST_TABLE_INCLUDE_FIELDS,
  CAMPAIGN_LIST_TABLE_ID,
  CAMPAIGN_PIPELINE_CARD_EXCLUDE_FIELDS,
  CAMPAIGN_PIPELINE_CARD_INCLUDE_FIELDS,
  CAMPAIGN_PIPELINE_CARD_TABLE_ID,
} from '@/lib/email/campaigns/campaign-list-columns';
import { computeEmailCampaignStats } from '@/lib/email/campaigns/stats';
import {
  EMPTY_CAMPAIGN_LIST_METRICS,
  type EmailCampaignListRow,
} from '@/lib/email/campaigns/list-metrics-types';
import type {
  CampaignViewMode,
  EmailCampaign,
  EmailCampaignStatus,
} from '@/lib/email/campaigns/types';

function readStoredViewMode(): CampaignViewMode {
  if (typeof window === 'undefined') {
    return 'table';
  }

  const stored = window.localStorage.getItem(CAMPAIGN_VIEW_MODE_STORAGE_KEY);
  return stored === 'pipeline' ? 'pipeline' : 'table';
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCount(value: number): string {
  return value.toLocaleString();
}

function formatStepCount(campaign: EmailCampaign): string {
  return formatCount(campaign.steps.length);
}

export default function CampaignsContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canUpdateCampaigns = useHasPermission('email-campaigns:update');
  const canDeleteCampaigns = useHasPermission('email-campaigns:delete');
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const canReadEmailConfig = useHasPermission('email-config:read');
  const canManageEmailConfig = useHasPermission('email-config:manage');
  const { data: campaignIdFormat } = useCampaignIdFormat(
    canReadEmailConfig || canManageEmailConfig,
  );
  const { campaigns, isLoading, updateCampaignStatus, isUpdatingStatus, refetch } =
    useEmailCampaigns();
  const { deleteCampaign, isDeleting: isDeletingCampaign } = useDeleteEmailCampaign();
  const { lists: contactLists } = useContactLists();
  const { lists: manualLists } = useManualLists();
  const { options: brandOptions } = useEmailConfigOptions('brand');
  const { options: typeOptions } = useEmailConfigOptions('campaign-type');
  const { options: regionOptions } = useEmailConfigOptions('region');
  const {
    totalSent,
    deliverability,
    openRate,
    ctr,
    isLoading: isMetricsLoading,
  } = useCampaignOverviewMetrics();
  const { metricsByCampaignId } = useCampaignListMetrics();
  const [viewMode, setViewMode] = useState<CampaignViewMode>(() =>
    readStoredViewMode(),
  );
  const [search, setSearch] = useState('');
  const [fieldFilters, setFieldFilters] = useState<FieldFilter[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSession, setFilterSession] = useState(0);
  const [pipelineColumnSettingsOpen, setPipelineColumnSettingsOpen] =
    useState(false);
  const [pipelineColumnSettingsSession, setPipelineColumnSettingsSession] =
    useState(0);
  const [externalToolbar, setExternalToolbar] =
    useState<DataTableExternalToolbarState | null>(null);
  const [deleteRequestTarget, setDeleteRequestTarget] =
    useState<EmailCampaign | null>(null);
  const [directDeleteTarget, setDirectDeleteTarget] =
    useState<EmailCampaign | null>(null);

  const {
    requests: pendingDeleteRequests,
    createDeleteRequest,
    isCreating: isCreatingDeleteRequest,
    refetch: refetchDeleteRequests,
  } = useCampaignDeleteRequests({ status: 'pending' });

  const pendingDeleteRequestCampaignIds = useMemo(
    () =>
      new Set(
        pendingDeleteRequests
          .map((request) => request.campaignId)
          .filter((campaignId): campaignId is string => Boolean(campaignId)),
      ),
    [pendingDeleteRequests],
  );

  const handleExternalToolbarChange = useCallback(
    (state: DataTableExternalToolbarState | null) => {
      setExternalToolbar((current) => {
        if (state === null) {
          return current === null ? current : null;
        }

        if (
          current &&
          current.showColumnSettings === state.showColumnSettings &&
          current.columnSettingsOpen === state.columnSettingsOpen &&
          current.openColumnSettings === state.openColumnSettings &&
          current.showFieldFilters === state.showFieldFilters &&
          current.filterActive === state.filterActive &&
          current.filterOpen === state.filterOpen &&
          current.activeFilterCount === state.activeFilterCount &&
          current.toggleFieldFilters === state.toggleFieldFilters
        ) {
          return current;
        }

        return state;
      });
    },
    [],
  );

  const tableToolbarActions =
    viewMode === 'table' ? (
      <>
        {externalToolbar?.showFieldFilters ? (
          <DataTableFilterButton
            active={externalToolbar.filterActive}
            open={externalToolbar.filterOpen}
            activeFilterCount={externalToolbar.activeFilterCount}
            onClick={externalToolbar.toggleFieldFilters}
          />
        ) : null}
        {externalToolbar?.showColumnSettings ? (
          <ColumnSettingsButton
            active={externalToolbar.columnSettingsOpen}
            onClick={externalToolbar.openColumnSettings}
          />
        ) : null}
      </>
    ) : null;

  const togglePipelineFieldFilters = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setFilterSession((session) => session + 1);
      }
      return !current;
    });
  }, []);

  const openPipelineColumnSettings = useCallback(() => {
    setPipelineColumnSettingsSession((current) => current + 1);
    setPipelineColumnSettingsOpen(true);
  }, []);

  const pipelineToolbarActions =
    viewMode === 'pipeline' ? (
      <>
        <DataTableFilterButton
          active={isFieldFilterActive(fieldFilters)}
          open={filterOpen}
          activeFilterCount={getActiveFieldFilters(fieldFilters).length}
          onClick={togglePipelineFieldFilters}
        />
        <ColumnSettingsButton
          active={pipelineColumnSettingsOpen}
          onClick={openPipelineColumnSettings}
        />
      </>
    ) : null;

  const toolbarTrailingActions =
    viewMode === 'table' ? tableToolbarActions : pipelineToolbarActions;

  useEffect(() => {
    window.localStorage.setItem(CAMPAIGN_VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const campaignStats = useMemo(
    () => computeEmailCampaignStats(campaigns),
    [campaigns],
  );

  const searchedCampaigns = useMemo(
    () => filterCampaignsBySearch(campaigns, search),
    [campaigns, search],
  );

  const tableRows = useMemo<EmailCampaignListRow[]>(
    () =>
      searchedCampaigns.map((campaign) => {
        const metrics = metricsByCampaignId.get(campaign.id);

        return {
          ...campaign,
          totalSent: metrics?.totalSent ?? EMPTY_CAMPAIGN_LIST_METRICS.totalSent,
          deliverability:
            metrics?.deliverability ?? EMPTY_CAMPAIGN_LIST_METRICS.deliverability,
          openRate: metrics?.openRate ?? EMPTY_CAMPAIGN_LIST_METRICS.openRate,
          ctr: metrics?.ctr ?? EMPTY_CAMPAIGN_LIST_METRICS.ctr,
          replyRate: metrics?.replyRate ?? EMPTY_CAMPAIGN_LIST_METRICS.replyRate,
          bounceRate: metrics?.bounceRate ?? EMPTY_CAMPAIGN_LIST_METRICS.bounceRate,
          unsubscribeRate:
            metrics?.unsubscribeRate ?? EMPTY_CAMPAIGN_LIST_METRICS.unsubscribeRate,
          sendingPace: metrics?.sendingPace ?? EMPTY_CAMPAIGN_LIST_METRICS.sendingPace,
        };
      }),
    [metricsByCampaignId, searchedCampaigns],
  );

  const listNameById = useMemo(() => {
    const names = new Map<string, string>();

    for (const list of contactLists) {
      names.set(list.id, list.name);
    }

    for (const list of manualLists) {
      names.set(list.id, list.name);
    }

    return names;
  }, [contactLists, manualLists]);

  const brandLabelById = useMemo(() => {
    const labels = new Map<string, string>();

    for (const option of brandOptions) {
      labels.set(option.id, option.label);
    }

    return labels;
  }, [brandOptions]);

  const typeLabelById = useMemo(() => {
    const labels = new Map<string, string>();

    for (const option of typeOptions) {
      labels.set(option.id, option.label);
    }

    return labels;
  }, [typeOptions]);

  const regionLabelById = useMemo(() => {
    const labels = new Map<string, string>();

    for (const option of regionOptions) {
      labels.set(option.id, option.label);
    }

    return labels;
  }, [regionOptions]);

  const {
    pauseCampaign,
    stopCampaign,
    resumeCampaign,
    isUpdating: isUpdatingCampaignActions,
  } = useCampaignActions({
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleMoveCampaign = useCallback(
    async (
      campaign: EmailCampaign,
      fromStatus: EmailCampaignStatus,
      toStatus: EmailCampaignStatus,
    ) => {
      const transitionError = getCampaignManualStatusChangeError(
        campaign,
        fromStatus,
        toStatus,
      );

      if (transitionError) {
        notifyError(transitionError);
        throw new Error(transitionError);
      }

      try {
        await updateCampaignStatus(campaign.id, toStatus);
      } catch (error) {
        notifyError(getApiErrorMessage(error, 'Failed to update campaign status'));
        throw error;
      }
    },
    [notifyError, updateCampaignStatus],
  );

  const renderCampaignStatus = useCallback(
    (row: EmailCampaign) => (
      <CampaignStatusSelect
        campaignName={row.name}
        status={row.status}
        mailboxSenders={row.mailboxSenders}
        pausedUntil={row.pausedUntil}
        statusBeforePause={row.statusBeforePause}
        canUpdate={canUpdateCampaigns}
        showPausedUntil
        formatPausedUntil={formatDate}
        isUpdating={isUpdatingCampaignActions || isUpdatingStatus}
        onStatusChange={async (nextStatus) => {
          await handleMoveCampaign(row, row.status, nextStatus);
        }}
        onPause={async (pausedUntil) => {
          await pauseCampaign(row.id, row.name, pausedUntil);
        }}
        onStop={async () => {
          await stopCampaign(row.id, row.name);
        }}
        onResume={async (options) => {
          await resumeCampaign(row.id, row.name, options);
        }}
      />
    ),
    [
      canUpdateCampaigns,
      handleMoveCampaign,
      isUpdatingCampaignActions,
      isUpdatingStatus,
      pauseCampaign,
      resumeCampaign,
      stopCampaign,
    ],
  );

  const columnOverrideContext = useMemo(
    () => ({
      brandLabelById,
      typeLabelById,
      regionLabelById,
      listNameById,
      formatDate,
      formatStepCount,
      renderStatus: renderCampaignStatus,
    }),
    [
      brandLabelById,
      listNameById,
      regionLabelById,
      renderCampaignStatus,
      typeLabelById,
    ],
  );

  const pipelineFilterColumnOverrides = useMemo(
    () => buildCampaignColumnOverrides(columnOverrideContext),
    [columnOverrideContext],
  );

  const tableColumnOverrides = useMemo(
    () => buildCampaignTableColumnOverrides(columnOverrideContext),
    [columnOverrideContext],
  );

  const pipelineCardColumnOverrides = useMemo(
    () => buildCampaignPipelineCardColumnOverrides(columnOverrideContext),
    [columnOverrideContext],
  );

  const {
    searchableFields: pipelineFilterSearchableFields,
    allColumns: pipelineFilterColumns,
  } = useTableColumns({
    tableName: CAMPAIGN_LIST_TABLE_ID,
    rows: searchedCampaigns,
    excludeFields: [...CAMPAIGN_LIST_EXCLUDE_FIELDS],
    includeFields: [...CAMPAIGN_LIST_INCLUDE_FIELDS],
    columnOverrides: pipelineFilterColumnOverrides,
  });

  const pipelineFilterColumnOptions = useMemo(
    () =>
      pipelineFilterColumns.map((column) => ({
        field: column.field,
        label: column.label,
      })),
    [pipelineFilterColumns],
  );

  const {
    visibleColumns: pipelineCardColumns,
    allColumns: pipelineCardAllColumns,
    hasUserOverride: pipelineCardHasUserOverride,
    saveUserPreferences: savePipelineCardUserPreferences,
    saveTeamDefaults: savePipelineCardTeamDefaults,
    resetUserPreferences: resetPipelineCardUserPreferences,
    isSaving: isSavingPipelineCardColumns,
    saveError: pipelineCardSaveError,
  } = useTableColumns({
    tableName: CAMPAIGN_PIPELINE_CARD_TABLE_ID,
    rows: searchedCampaigns,
    excludeFields: [...CAMPAIGN_PIPELINE_CARD_EXCLUDE_FIELDS],
    includeFields: [...CAMPAIGN_PIPELINE_CARD_INCLUDE_FIELDS],
    columnOverrides: pipelineCardColumnOverrides,
  });

  const pipelineFilterValueOptions = useMemo(
    () =>
      buildFilterValueOptionsFromRows(
        searchedCampaigns,
        pipelineFilterColumns
          .filter(
            (column) =>
              pipelineFilterColumnOverrides[column.field]?.filterable !== false,
          )
          .map((column) => column.field),
        pipelineFilterColumnOverrides,
      ),
    [
      pipelineFilterColumnOverrides,
      pipelineFilterColumns,
      searchedCampaigns,
    ],
  );

  const fieldFilteredCampaigns = useMemo(
    () =>
      filterTableRows({
        rows: searchedCampaigns,
        searchQuery: '',
        searchableFields: pipelineFilterSearchableFields,
        fieldFilters,
        columnOverrides: pipelineFilterColumnOverrides,
      }),
    [
      fieldFilters,
      pipelineFilterColumnOverrides,
      pipelineFilterSearchableFields,
      searchedCampaigns,
    ],
  );

  const activeFieldFilters = useMemo(
    () => getActiveFieldFilters(fieldFilters),
    [fieldFilters],
  );

  const pipelineBoardKey = buildCampaignPipelineBoardKey(search, fieldFilters);
  const hasActivePipelineFilters = activeFieldFilters.length > 0;

  const statsLoading = isLoading || isMetricsLoading;

  const stats = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total campaigns',
        value: campaignStats.total.toString(),
        icon: EmailOutlinedIcon,
      },
      {
        key: 'totalSent',
        label: 'Total sent',
        value: formatCount(totalSent),
        icon: SendOutlinedIcon,
      },
      {
        key: 'deliverability',
        label: 'Deliverability',
        value: formatMetricValue(deliverability, 'percent'),
        icon: MarkEmailReadOutlinedIcon,
      },
      {
        key: 'openRate',
        label: 'Open rate',
        value: formatMetricValue(openRate, 'percent'),
        icon: VisibilityOutlinedIcon,
      },
      {
        key: 'ctr',
        label: 'CTR',
        value: formatMetricValue(ctr, 'percent'),
        icon: AdsClickOutlinedIcon,
      },
    ] as const,
    [campaignStats.total, totalSent, deliverability, openRate, ctr],
  );

  const handleOpenCampaign = useCallback(
    (campaign: EmailCampaign) => {
      if (campaign.status === 'draft') {
        router.push(toOrgPath(`/email/campaigns/${campaign.id}/edit`));
        return;
      }

      router.push(toOrgPath(`/email/campaigns/${campaign.id}`));
    },
    [router, toOrgPath],
  );

  const handleDeleteCampaign = useCallback(
    async (campaignId: string) => {
      try {
        await deleteCampaign(campaignId);
        await Promise.all([refetch(), refetchDeleteRequests()]);
        notifySuccess('Campaign deleted');
      } catch (error) {
        notifyError(
          getApiErrorMessage(error, 'Unable to delete this campaign. Please try again.'),
        );
      }
    },
    [deleteCampaign, notifyError, notifySuccess, refetch, refetchDeleteRequests],
  );

  const handleCreateDeleteRequest = useCallback(
    async (reason: string) => {
      if (!deleteRequestTarget) {
        return;
      }

      try {
        await createDeleteRequest({
          campaignId: deleteRequestTarget.id,
          reason,
        });
        await refetchDeleteRequests();
        notifySuccess('Delete request submitted');
        setDeleteRequestTarget(null);
      } catch (error) {
        notifyError(getApiErrorMessage(error, 'Unable to submit delete request'));
        throw error;
      }
    },
    [
      createDeleteRequest,
      deleteRequestTarget,
      notifyError,
      notifySuccess,
      refetchDeleteRequests,
    ],
  );

  const handleDirectDeleteConfirm = useCallback(async () => {
    if (!directDeleteTarget) {
      return;
    }

    try {
      await handleDeleteCampaign(directDeleteTarget.id);
      setDirectDeleteTarget(null);
    } catch {
      // handleDeleteCampaign already notifies.
    }
  }, [directDeleteTarget, handleDeleteCampaign]);

  const handleMoveRejected = useCallback(
    (message: string) => {
      notifyError(message);
    },
    [notifyError],
  );

  function handlePipelineFieldFiltersApply(filters: FieldFilter[]) {
    setFieldFilters(filters);
  }

  const showCampaignIdFormatSetup =
    canManageEmailConfig && campaignIdFormat && !campaignIdFormat.configured;

  return (
    <Stack spacing={3}>
      {showCampaignIdFormatSetup ? (
        <Alert
          severity="warning"
          action={
            <Button
              component={Link}
              href={toOrgPath('/email/settings/campaign-id-format')}
              size="small"
              color="inherit"
            >
              Set format
            </Button>
          }
        >
          Configure your campaign ID format once before creating campaigns.
        </Alert>
      ) : null}

      <Box className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.key}
              className="dashboard-stat-card h-full min-w-0 rounded-[24px] shadow-none"
            >
              <CardContent className="p-4">
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <Box className="rounded-2xl bg-primary-soft p-2.5 text-primary">
                    <Icon fontSize="small" />
                  </Box>
                  <Box className="min-w-0 flex-1">
                    <Typography variant="body2" color="text.secondary" className="text-xs">
                      {stat.label}
                    </Typography>
                    {statsLoading ? (
                      <Skeleton width={56} height={32} className="mt-1" />
                    ) : (
                      <Typography variant="h5" className="mt-0.5 font-bold">
                        {stat.value}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={2.5} className="mb-5">
            <CampaignsToolbar
              viewMode={viewMode}
              search={search}
              onViewModeChange={setViewMode}
              onSearchChange={setSearch}
              trailingActions={toolbarTrailingActions}
            />

            {viewMode === 'pipeline' ? (
              <DataTableFieldFiltersSection
                filterOpen={filterOpen}
                filterColumns={pipelineFilterColumnOptions}
                fieldFilters={fieldFilters}
                filterValueOptions={pipelineFilterValueOptions}
                onFilterApply={handlePipelineFieldFiltersApply}
                onFilterToggle={togglePipelineFieldFilters}
                filterSession={filterSession}
              />
            ) : null}

          </Stack>

          {viewMode === 'table' ? (
            <DataTable<EmailCampaignListRow>
              tableId={CAMPAIGN_LIST_TABLE_ID}
              rows={tableRows}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              hideToolbar
              onExternalToolbarChange={handleExternalToolbarChange}
              onRowClick={(row) =>
                router.push(toOrgPath(`/email/campaigns/${row.id}`))
              }
              excludeFields={[...CAMPAIGN_LIST_EXCLUDE_FIELDS]}
              includeFields={[...CAMPAIGN_LIST_TABLE_INCLUDE_FIELDS]}
              emptyMessage="No email campaigns yet. Create your first campaign to get started."
              noResultsMessage="No campaigns match your search or filters. Try a different term."
              enableSearch={false}
              enableFieldFilters
              columnOverrides={tableColumnOverrides}
              rowActions={
                canUpdateCampaigns ||
                canDeleteCampaigns ||
                canRequestDelete
                  ? (row) => (
                      <CampaignRowActions
                        campaign={row}
                        isUpdating={isUpdatingCampaignActions}
                        canDirectDelete={canDeleteCampaigns}
                        canRequestDelete={canRequestDelete}
                        hasPendingDeleteRequest={pendingDeleteRequestCampaignIds.has(
                          row.id,
                        )}
                        onPause={pauseCampaign}
                        onStop={stopCampaign}
                        onResume={resumeCampaign}
                        onDirectDelete={setDirectDeleteTarget}
                        onRequestDelete={setDeleteRequestTarget}
                      />
                    )
                  : undefined
              }
            />
          ) : (
            <>
              <CampaignPipelineBoard
                key={pipelineBoardKey}
                campaigns={fieldFilteredCampaigns}
                cardColumns={pipelineCardColumns}
                canDrag={canUpdateCampaigns}
                hasActiveFilters={hasActivePipelineFilters || search.trim().length > 0}
                onMoveCampaign={handleMoveCampaign}
                onMoveRejected={handleMoveRejected}
                onOpenCampaign={handleOpenCampaign}
              />

              <ColumnSettingsDialog
                key={pipelineColumnSettingsSession}
                open={pipelineColumnSettingsOpen}
                tableName={CAMPAIGN_PIPELINE_CARD_TABLE_ID}
                initialColumns={pipelineCardAllColumns}
                hasUserOverride={pipelineCardHasUserOverride}
                isSaving={isSavingPipelineCardColumns}
                saveError={pipelineCardSaveError}
                onClose={() => setPipelineColumnSettingsOpen(false)}
                onSaveUserPreferences={async (columns) => {
                  await savePipelineCardUserPreferences(columns);
                }}
                onSaveTeamDefaults={async (columns) => {
                  await savePipelineCardTeamDefaults(columns);
                }}
                onResetUserPreferences={async () => {
                  await resetPipelineCardUserPreferences();
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <RequestCampaignDeleteDialog
        open={Boolean(deleteRequestTarget)}
        campaignName={deleteRequestTarget?.name ?? ''}
        isSubmitting={isCreatingDeleteRequest}
        onClose={() => setDeleteRequestTarget(null)}
        onSubmit={handleCreateDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(directDeleteTarget)}
        title="Delete campaign"
        description={
          <>
            Delete <strong>{directDeleteTarget?.name}</strong> permanently? This
            action cannot be undone.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        isLoading={isDeletingCampaign}
        onClose={() => setDirectDeleteTarget(null)}
        onConfirm={() => void handleDirectDeleteConfirm()}
      />
    </Stack>
  );
}

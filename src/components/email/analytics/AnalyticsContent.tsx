'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import DashboardTabBar from '@/components/email/analytics/DashboardTabBar';
import GlobalFilterBar from '@/components/email/analytics/GlobalFilterBar';
import NewDashboardDialog from '@/components/email/analytics/modals/NewDashboardDialog';
import RenameDashboardDialog from '@/components/email/analytics/modals/RenameDashboardDialog';
import WidgetGrid from '@/components/email/analytics/WidgetGrid';
import AddWidgetWizard from '@/components/email/analytics/wizard/AddWidgetWizard';
import { useConfirm } from '@/hooks/useConfirm';
import {
  useAnalyticsCampaignCount,
  useAnalyticsDashboards,
  useAnalyticsFilterOptions,
} from '@/hooks/useAnalyticsDashboards';
import { getApiErrorMessage } from '@/lib/api';
import type { AnalyticsDashboard, AnalyticsFilters, AnalyticsWidget } from '@/lib/email/analytics/types';
import type { WidgetWizardFormValues } from '@/lib/schemas/analytics-widget';

export interface AnalyticsContentHandle {
  openAddWidget: () => void;
}

interface AnalyticsContentProps {
  variant?: 'full' | 'embedded';
  hideEmptyState?: boolean;
  onDashboardReady?: (ready: boolean) => void;
}

const EMBEDDED_DEFAULT_DASHBOARD = {
  name: 'Custom analytics',
  visibility: 'private' as const,
};

const AnalyticsContent = forwardRef<AnalyticsContentHandle, AnalyticsContentProps>(
  function AnalyticsContent(
    { variant = 'full', hideEmptyState = false, onDashboardReady },
    ref,
  ) {
  const embedded = variant === 'embedded';
  const confirm = useConfirm();
  const {
    dashboards,
    activeDashboard,
    activeDashboardId,
    setActiveDashboardId,
    isLoading,
    error,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    updateWidget,
    deleteWidget,
    isCreatingDashboard,
    isUpdatingDashboard,
    isAddingWidget,
    isUpdatingWidget,
    isDeletingWidget,
  } = useAnalyticsDashboards();

  const [isNewDashboardOpen, setIsNewDashboardOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<AnalyticsDashboard | null>(null);
  const [widgetWizardOpen, setWidgetWizardOpen] = useState(false);
  const [widgetWizardMode, setWidgetWizardMode] = useState<'create' | 'edit'>('create');
  const [editingWidget, setEditingWidget] = useState<AnalyticsWidget | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const autoCreateStartedRef = useRef(false);

  const { data: filterOptions } = useAnalyticsFilterOptions();
  const globalFilters = embedded ? {} : (activeDashboard?.globalFilters ?? {});
  const { data: campaignCountData } = useAnalyticsCampaignCount(globalFilters);

  useEffect(() => {
    if (!embedded || isLoading || dashboards.length > 0 || autoCreateStartedRef.current) {
      return;
    }

    autoCreateStartedRef.current = true;

    void (async () => {
      try {
        setActionError(null);
        await createDashboard(EMBEDDED_DEFAULT_DASHBOARD);
      } catch (createError) {
        autoCreateStartedRef.current = false;
        setActionError(getApiErrorMessage(createError, 'Failed to initialize analytics'));
      }
    })();
  }, [createDashboard, dashboards.length, embedded, isLoading]);

  const persistGlobalFilters = useCallback(
    async (nextFilters: AnalyticsFilters) => {
      if (!activeDashboard) {
        return;
      }

      try {
        setActionError(null);
        await updateDashboard(activeDashboard.id, { globalFilters: nextFilters });
      } catch (updateError) {
        setActionError(getApiErrorMessage(updateError, 'Failed to save filters'));
      }
    },
    [activeDashboard, updateDashboard],
  );

  async function handleCreateDashboard(input: {
    name: string;
    visibility: AnalyticsDashboard['visibility'];
  }) {
    setActionError(null);
    await createDashboard(input);
  }

  async function handleRenameDashboard(name: string) {
    if (!renameTarget) {
      return;
    }

    setActionError(null);
    await updateDashboard(renameTarget.id, { name });
  }

  async function handleDeleteDashboard(dashboard: AnalyticsDashboard) {
    const shouldDelete = await confirm({
      title: `Delete "${dashboard.name}"?`,
      description: 'This dashboard and all of its widgets will be permanently removed.',
      variant: 'destructive',
      confirmLabel: 'Delete dashboard',
    });

    if (!shouldDelete) {
      return;
    }

    setActionError(null);
    await deleteDashboard(dashboard.id);
  }

  async function handleDeleteWidget(widget: AnalyticsWidget) {
    if (!activeDashboard) {
      return;
    }

    const shouldDelete = await confirm({
      title: `Delete "${widget.name}"?`,
      description: 'This widget will be removed from the dashboard.',
      variant: 'destructive',
      confirmLabel: 'Delete widget',
    });

    if (!shouldDelete) {
      return;
    }

    setActionError(null);
    await deleteWidget(activeDashboard.id, widget.id);
  }

  async function handleWidgetSubmit(values: WidgetWizardFormValues) {
    if (!activeDashboard) {
      return;
    }

    setActionError(null);

    const payload = {
      name: values.name,
      metric: values.metric,
      groupBy: values.groupBy,
      chartType: values.chartType,
      filters: values.filters,
    };

    if (widgetWizardMode === 'create') {
      await addWidget(activeDashboard.id, payload);
      return;
    }

    if (!editingWidget) {
      return;
    }

    await updateWidget(activeDashboard.id, editingWidget.id, payload);
  }

  const openCreateWidgetWizard = useCallback(() => {
    setWidgetWizardMode('create');
    setEditingWidget(null);
    setWidgetWizardOpen(true);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      openAddWidget: () => {
        if (!activeDashboard) {
          return;
        }
        openCreateWidgetWizard();
      },
    }),
    [activeDashboard, openCreateWidgetWizard],
  );

  useEffect(() => {
    onDashboardReady?.(Boolean(activeDashboard) && !isLoading);
  }, [activeDashboard, isLoading, onDashboardReady]);

  function openEditWidgetWizard(widget: AnalyticsWidget) {
    setWidgetWizardMode('edit');
    setEditingWidget(widget);
    setWidgetWizardOpen(true);
  }

  const addWidgetWizard = (
    <AddWidgetWizard
      key={`${widgetWizardMode}-${editingWidget?.id ?? 'new'}-${widgetWizardOpen ? 'open' : 'closed'}`}
      open={widgetWizardOpen}
      mode={widgetWizardMode}
      initialWidget={editingWidget}
      isSaving={isAddingWidget || isUpdatingWidget || isDeletingWidget}
      onClose={() => setWidgetWizardOpen(false)}
      onSubmit={handleWidgetSubmit}
    />
  );

  if (isLoading) {
    if (embedded && hideEmptyState) {
      return addWidgetWizard;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: embedded ? 4 : 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (dashboards.length === 0) {
    if (embedded) {
      if (hideEmptyState) {
        return (
          <Stack spacing={2}>
            {actionError ? <Alert severity="error">{actionError}</Alert> : null}
            {addWidgetWizard}
          </Stack>
        );
      }

      return (
        <Stack spacing={2}>
          {actionError ? <Alert severity="error">{actionError}</Alert> : null}
          <Box
            className="dashboard-panel rounded-2xl"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 5,
              px: 3,
            }}
          >
            <CircularProgress size={28} />
          </Box>
          {addWidgetWizard}
        </Stack>
      );
    }

    return (
      <Box
        className="dashboard-panel rounded-2xl"
        sx={{
          py: 10,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
          Create your first dashboard
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, mx: 'auto', maxWidth: 520 }}
        >
          Build custom analytics views with widgets tailored to your campaigns, brands, and regions.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsNewDashboardOpen(true)}
        >
          Create Dashboard
        </Button>

        <NewDashboardDialog
          key="empty-state-new-dashboard"
          open={isNewDashboardOpen}
          isSaving={isCreatingDashboard}
          onClose={() => setIsNewDashboardOpen(false)}
          onCreate={handleCreateDashboard}
        />
      </Box>
    );
  }

  return (
    <Stack spacing={embedded ? 2 : 0}>
      {actionError ? <Alert severity="error" sx={{ mb: embedded ? 0 : 2 }}>{actionError}</Alert> : null}

      {!embedded ? (
        <DashboardTabBar
          dashboards={dashboards}
          activeDashboardId={activeDashboardId}
          onSelect={setActiveDashboardId}
          onCreate={() => setIsNewDashboardOpen(true)}
          onRename={setRenameTarget}
          onDelete={(dashboard) => void handleDeleteDashboard(dashboard)}
        />
      ) : null}

      {activeDashboard ? (
        <>
          {!embedded ? (
            <GlobalFilterBar
              filters={globalFilters}
              filterOptions={filterOptions}
              campaignCount={campaignCountData?.count ?? null}
              onChange={(nextFilters) => void persistGlobalFilters(nextFilters)}
            />
          ) : null}

          <WidgetGrid
            dashboard={activeDashboard}
            globalFilters={globalFilters}
            hideEmptyState={embedded && hideEmptyState}
            onAddWidget={openCreateWidgetWizard}
            onEditWidget={openEditWidgetWizard}
            onDeleteWidget={(widget) => void handleDeleteWidget(widget)}
          />
        </>
      ) : null}

      {!embedded ? (
        <>
          <NewDashboardDialog
            key={isNewDashboardOpen ? 'new-dashboard-open' : 'new-dashboard-closed'}
            open={isNewDashboardOpen}
            isSaving={isCreatingDashboard}
            onClose={() => setIsNewDashboardOpen(false)}
            onCreate={handleCreateDashboard}
          />

          <RenameDashboardDialog
            key={renameTarget?.id ?? 'rename-dashboard-closed'}
            open={Boolean(renameTarget)}
            initialName={renameTarget?.name ?? ''}
            isSaving={isUpdatingDashboard}
            onClose={() => setRenameTarget(null)}
            onSave={handleRenameDashboard}
          />
        </>
      ) : null}

      {addWidgetWizard}
    </Stack>
  );
  },
);

export default AnalyticsContent;

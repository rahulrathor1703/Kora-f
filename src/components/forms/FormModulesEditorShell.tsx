'use client';

import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import FormModuleSelect from '@/components/forms/FormModuleSelect';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useOptionalOrgSlug } from '@/contexts/org-slug';
import { orgPath } from '@/lib/org-path';

export type FormModulesEditorTab = 'layout' | 'summary' | 'tables';

interface FormModulesEditorShellProps {
  formKey: string;
  activeTab: FormModulesEditorTab;
  onTabChange: (tab: FormModulesEditorTab) => void;
  supportsTableColumns: boolean;
  hasUnsavedChanges: boolean;
  readOnly?: boolean;
  isSubmitting?: boolean;
  isPublishing?: boolean;
  /** Org settings editor vs platform baseline editor. */
  scope?: 'org' | 'platform';
  /** Saved draft differs from what organizations see (platform only). */
  hasUnpublishedDraft?: boolean;
  onNavigateToFormKey: (formKey: string) => void;
  onDiscard: () => void;
  onSave: () => void;
  onPublish?: () => void;
  children: React.ReactNode;
}

export default function FormModulesEditorShell({
  formKey,
  activeTab,
  onTabChange,
  supportsTableColumns,
  hasUnsavedChanges,
  readOnly = false,
  isSubmitting = false,
  isPublishing = false,
  scope = 'org',
  hasUnpublishedDraft = false,
  onNavigateToFormKey,
  onDiscard,
  onSave,
  onPublish,
  children,
}: FormModulesEditorShellProps) {
  const router = useRouter();
  const orgSlug = useOptionalOrgSlug();
  if (scope === 'org' && !orgSlug) {
    throw new Error('useOrgSlug must be used within OrgSlugProvider');
  }
  const backHref =
    scope === 'platform' ? '/platform/forms' : orgPath(orgSlug!, '/settings');
  const backLabel = scope === 'platform' ? 'Forms' : 'Settings';
  const pageTitle = scope === 'platform' ? 'Platform form baselines' : 'Manage Forms';
  const [pendingNavigation, setPendingNavigation] = useState<
    { type: 'back' } | { type: 'module'; formKey: string } | null
  >(null);

  const runOrConfirm = useCallback(
    (action: { type: 'back' } | { type: 'module'; formKey: string }) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(action);
        return;
      }

      if (action.type === 'back') {
        router.push(backHref);
        return;
      }

      onNavigateToFormKey(action.formKey);
    },
    [backHref, hasUnsavedChanges, onNavigateToFormKey, router],
  );

  function confirmDiscardNavigation() {
    if (!pendingNavigation) {
      return;
    }

    onDiscard();
    const action = pendingNavigation;
    setPendingNavigation(null);

    if (action.type === 'back') {
      router.push(backHref);
      return;
    }

    onNavigateToFormKey(action.formKey);
  }

  function handleBackClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    runOrConfirm({ type: 'back' });
  }

  function handleModuleChange(nextFormKey: string) {
    if (nextFormKey === formKey) {
      return;
    }
    runOrConfirm({ type: 'module', formKey: nextFormKey });
  }

  return (
    <Stack spacing={0} className="min-h-[calc(100vh-12rem)]">
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ alignItems: { lg: 'flex-start' }, justifyContent: 'space-between' }}
        className="mb-4"
      >
        <Box className="min-w-0 flex-1">
          <SettingsNavButton
            href={backHref}
            label={backLabel}
            onClick={handleBackClick}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h4" component="h1" className="mt-4 font-bold text-foreground">
              {pageTitle}
            </Typography>
            {scope === 'platform' && hasUnpublishedDraft ? (
              <Chip
                size="small"
                label="Unpublished draft"
                color="warning"
                variant="outlined"
                className="mt-4"
              />
            ) : null}
          </Stack>
        </Box>

        <FormModuleSelect
          value={formKey}
          scope={scope}
          onChange={handleModuleChange}
        />
      </Stack>

      <Paper className="dashboard-panel surface-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl shadow-none">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          className="px-4 pt-2"
        >
          <Tabs
            value={activeTab}
            onChange={(_event, nextTab: FormModulesEditorTab) => onTabChange(nextTab)}
            aria-label="Form module editor sections"
          >
            <Tab
              value="layout"
              icon={<ViewQuiltOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Layout"
            />
            <Tab
              value="summary"
              icon={<ViewListOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Summary"
            />
            {supportsTableColumns ? (
              <Tab
                value="tables"
                icon={<TableChartOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Tables"
              />
            ) : null}
          </Tabs>

          {!readOnly && scope === 'platform' && onPublish ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<SendOutlinedIcon fontSize="small" />}
              className="mb-2 sm:mb-0 sm:mr-2"
              disabled={
                hasUnsavedChanges ||
                isSubmitting ||
                isPublishing ||
                !hasUnpublishedDraft
              }
              title={
                hasUnsavedChanges
                  ? 'Save your draft first, then publish'
                  : !hasUnpublishedDraft
                    ? 'Draft matches the published version — change and save draft to publish'
                    : undefined
              }
              onClick={onPublish}
            >
              {isPublishing ? 'Publishing…' : 'Publish'}
            </Button>
          ) : null}
        </Stack>

        <Box
          className={
            activeTab === 'layout'
              ? 'min-h-0 flex-1 overflow-auto'
              : 'min-h-0 flex-1 overflow-auto p-4'
          }
        >
          {children}
        </Box>

        {!readOnly ? (
          <Box className="sticky bottom-0 border-t border-border/60 bg-background/95 p-3 backdrop-blur">
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
            >
              <Typography variant="body2" color="text.secondary" className="mr-auto">
                {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ReplayOutlinedIcon fontSize="small" />}
                disabled={!hasUnsavedChanges || isSubmitting}
                onClick={onDiscard}
              >
                Discard Changes
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon fontSize="small" />}
                disabled={!hasUnsavedChanges || isSubmitting}
                onClick={onSave}
              >
                {isSubmitting ? 'Saving…' : 'Save/Draft Layout'}
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Paper>

      <Dialog open={pendingNavigation !== null} onClose={() => setPendingNavigation(null)}>
        <DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            You have unsaved layout changes. Discard them and continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingNavigation(null)}>Stay</Button>
          <Button variant="contained" color="warning" onClick={confirmDiscardNavigation}>
            Discard and continue
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

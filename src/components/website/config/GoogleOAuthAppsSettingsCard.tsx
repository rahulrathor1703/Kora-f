'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import WebsiteGoogleOAuthAppForm from '@/components/website/config/WebsiteGoogleOAuthAppForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FormAlert from '@/components/ui/FormAlert';
import { useOrganizationGoogleConnections } from '@/hooks/useOrganizationGoogleConnections';
import { useOrganizationGoogleOAuthApps } from '@/hooks/useOrganizationGoogleOAuthApps';
import { useNotify } from '@/hooks/useNotify';
import type {
  GoogleOAuthApp,
  OrganizationGoogleConnection,
} from '@/lib/api/services/website.service';

function maskClientId(clientId: string): string {
  if (clientId.length <= 20) {
    return clientId;
  }

  return `${clientId.slice(0, 10)}…${clientId.slice(-6)}`;
}

function formatConnectedDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function GoogleOAuthAppsSettingsCard({
  canManageIntegrations = false,
}: {
  canManageIntegrations?: boolean;
}) {
  const { notifySuccess } = useNotify();
  const {
    apps,
    isLoading,
    createApp,
    updateApp,
    deleteApp,
    refetch: refetchApps,
    isCreating,
    isUpdating,
    isDeleting: isDeletingApp,
  } = useOrganizationGoogleOAuthApps();
  const {
    connections,
    isLoading: isConnectionsLoading,
    error: connectionsError,
    deleteConnection,
    isDeleting: isDeletingConnection,
  } = useOrganizationGoogleConnections();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [appToDelete, setAppToDelete] = useState<GoogleOAuthApp | null>(null);
  const [connectionToDelete, setConnectionToDelete] =
    useState<OrganizationGoogleConnection | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const connectionsByAppId = useMemo(() => {
    const grouped = new Map<string, OrganizationGoogleConnection[]>();

    for (const connection of connections) {
      const existing = grouped.get(connection.oauthAppId) ?? [];
      existing.push(connection);
      grouped.set(connection.oauthAppId, existing);
    }

    return grouped;
  }, [connections]);

  async function handleDeleteAppConfirm() {
    if (!appToDelete) {
      return;
    }

    setActionError(null);

    try {
      await deleteApp(appToDelete.id);
      setAppToDelete(null);
      notifySuccess('OAuth app removed.');
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to delete OAuth app.',
      );
    }
  }

  async function handleDeleteConnectionConfirm() {
    if (!connectionToDelete) {
      return;
    }

    setActionError(null);

    try {
      await deleteConnection(connectionToDelete.id);
      await refetchApps();
      setConnectionToDelete(null);
      notifySuccess(`${connectionToDelete.email} removed.`);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to remove Google account.',
      );
    }
  }

  async function handleSaveLabel(appId: string) {
    setActionError(null);
    try {
      await updateApp(appId, { label: editLabel.trim() || 'Default' });
      setEditingAppId(null);
      notifySuccess('OAuth app updated.');
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to update OAuth app.',
      );
    }
  }

  if (!canManageIntegrations) {
    return null;
  }

  return (
    <>
      <Card variant="outlined" className="rounded-2xl border-divider">
        <CardContent className="p-5">
          <Stack spacing={2}>
            <div>
              <Typography variant="h6" className="font-bold">
                Google OAuth apps
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Saved OAuth clients for connecting Google accounts to websites.
                Reuse an app when adding websites on the same Google Cloud project.
              </Typography>
            </div>

            {isLoading ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Loading OAuth apps…
                </Typography>
              </Stack>
            ) : null}

            {!isLoading && apps.length === 0 ? (
              <Alert severity="info" className="rounded-xl">
                No OAuth apps saved yet. Add one when you create your first website,
                or add one below.
              </Alert>
            ) : null}

            {!isLoading
              ? apps.map((app) => {
                  const appConnections = connectionsByAppId.get(app.id) ?? [];

                  return (
                    <Card
                      key={app.id}
                      variant="outlined"
                      className="rounded-xl border-divider"
                    >
                      <CardContent className="p-4">
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'flex-start' }}
                          >
                            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" className="font-semibold">
                                {app.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {maskClientId(app.clientId)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                className="block truncate"
                              >
                                {app.redirectUri}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {app.connectionCount} connected account
                                {app.connectionCount === 1 ? '' : 's'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Rename">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingAppId(app.id);
                                    setEditLabel(app.label);
                                  }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  app.connectionCount > 0
                                    ? 'Remove connected accounts first'
                                    : 'Delete OAuth app'
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={isDeletingApp || app.connectionCount > 0}
                                    onClick={() => setAppToDelete(app)}
                                  >
                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Stack>

                          {isConnectionsLoading ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: 'center' }}
                            >
                              <CircularProgress size={14} />
                              <Typography variant="caption" color="text.secondary">
                                Loading connected accounts…
                              </Typography>
                            </Stack>
                          ) : null}

                          {!isConnectionsLoading && appConnections.length > 0 ? (
                            <Box>
                              <Divider className="mb-2" />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                className="mb-2 block font-semibold uppercase tracking-wide"
                              >
                                Connected accounts
                              </Typography>
                              <Stack spacing={1}>
                                {appConnections.map((connection) => {
                                  const isLinkedToWebsites =
                                    connection.propertyCount > 0;

                                  return (
                                    <Stack
                                      key={connection.id}
                                      direction="row"
                                      spacing={1}
                                      sx={{
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}
                                      className="rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-900/50"
                                    >
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          className="truncate font-medium"
                                        >
                                          {connection.email}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Connected{' '}
                                          {formatConnectedDate(connection.connectedAt)}
                                          {isLinkedToWebsites
                                            ? ` · ${connection.propertyCount} linked website${connection.propertyCount === 1 ? '' : 's'}`
                                            : ''}
                                        </Typography>
                                      </Box>
                                      <Tooltip
                                        title={
                                          isLinkedToWebsites
                                            ? 'Unlink this account from all websites first'
                                            : 'Remove account'
                                        }
                                      >
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            disabled={
                                              isDeletingConnection ||
                                              isLinkedToWebsites
                                            }
                                            aria-label={`Remove ${connection.email}`}
                                            onClick={() =>
                                              setConnectionToDelete(connection)
                                            }
                                          >
                                            <DeleteOutlineOutlinedIcon fontSize="small" />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Stack>
                                  );
                                })}
                              </Stack>
                            </Box>
                          ) : null}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })
              : null}

            {connectionsError ? (
              <Alert severity="error" className="rounded-xl">
                {connectionsError}
              </Alert>
            ) : null}

            {actionError ? <FormAlert message={actionError} /> : null}

            <Accordion
              expanded={showAddForm}
              onChange={(_event, expanded) => setShowAddForm(expanded)}
              disableGutters
              className="rounded-xl border border-divider shadow-none before:hidden"
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="text.secondary">
                  Add new OAuth app
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="px-4 pb-4">
                <WebsiteGoogleOAuthAppForm
                  onCreateApp={createApp}
                  isSaving={isCreating}
                  onSaved={() => {
                    setShowAddForm(false);
                    notifySuccess('OAuth app saved.');
                  }}
                />
              </AccordionDetails>
            </Accordion>
          </Stack>
        </CardContent>

        <Dialog
          open={Boolean(editingAppId)}
          onClose={() => setEditingAppId(null)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Rename OAuth app</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Label"
              value={editLabel}
              onChange={(event) => setEditLabel(event.target.value)}
              fullWidth
              className="mt-2"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingAppId(null)} className="normal-case">
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isUpdating || !editingAppId}
              onClick={() => editingAppId && void handleSaveLabel(editingAppId)}
              className="normal-case"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      <ConfirmDialog
        open={appToDelete !== null}
        title={`Delete "${appToDelete?.label}"?`}
        description="This OAuth app will be removed. You can add it again later if needed."
        confirmLabel="Delete OAuth app"
        variant="destructive"
        isLoading={isDeletingApp}
        onClose={() => setAppToDelete(null)}
        onConfirm={() => void handleDeleteAppConfirm()}
      />

      <ConfirmDialog
        open={connectionToDelete !== null}
        title={`Remove ${connectionToDelete?.email}?`}
        description="This Google account will be removed from your organization. You can connect it again later."
        confirmLabel="Remove account"
        variant="destructive"
        isLoading={isDeletingConnection}
        onClose={() => setConnectionToDelete(null)}
        onConfirm={() => void handleDeleteConnectionConfirm()}
      />
    </>
  );
}

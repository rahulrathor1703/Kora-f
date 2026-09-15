'use client';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import WebsiteGoogleOAuthAppForm from '@/components/website/config/WebsiteGoogleOAuthAppForm';
import { useOrganizationGoogleConnections } from '@/hooks/useOrganizationGoogleConnections';
import { useOrganizationGoogleOAuthApps } from '@/hooks/useOrganizationGoogleOAuthApps';
import { useOrgSlug } from '@/contexts/org-slug';
import { useNotify } from '@/hooks/useNotify';
import type {
  GoogleOAuthApp,
  OrganizationGoogleConnection,
} from '@/lib/api/services/website.service';
import { startOrganizationGoogleOAuth } from '@/lib/website/google-oauth';
import type { WebsiteWizardDraft } from '@/lib/website/wizard-session';
import { writeWebsiteWizardDraft } from '@/lib/website/wizard-session';

interface WebsiteWizardGoogleStepProps {
  draft: WebsiteWizardDraft;
  canManageIntegrations: boolean;
  onSelectOAuthApp: (oauthAppId: string | null) => void;
  onSelectConnection: (connectionId: string | null) => void;
  onGoogleConnected?: () => void;
}

type WizardPhase = 'pickApp' | 'pickAccount' | 'addApp';

function formatConnectedDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function maskClientId(clientId: string): string {
  if (clientId.length <= 16) {
    return clientId;
  }

  return `${clientId.slice(0, 8)}…${clientId.slice(-8)}`;
}

function GoogleSignInButton({
  disabled,
  loading,
  onClick,
  label = 'Connect new Google account',
}: {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button
      variant="outlined"
      size="large"
      disabled={disabled || loading}
      onClick={onClick}
      className="rounded-xl border-divider bg-white px-6 py-3 normal-case shadow-sm hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      sx={{ width: '100%', maxWidth: 360, justifyContent: 'flex-start', gap: 2 }}
    >
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Box
          component="span"
          sx={{
            width: 24,
            height: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: '#4285F4',
          }}
        >
          G
        </Box>
      )}
      <Typography variant="button" className="font-semibold normal-case text-neutral-800 dark:text-neutral-100">
        {loading ? 'Opening Google…' : label}
      </Typography>
    </Button>
  );
}

function OAuthAppCard({
  app,
  selected,
  onSelect,
}: {
  app: GoogleOAuthApp;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      variant="outlined"
      className={`rounded-2xl border transition-colors ${
        selected ? 'border-primary-main bg-primary-main/5' : 'border-divider'
      }`}
    >
      <CardActionArea onClick={onSelect} className="rounded-2xl">
        <CardContent className="p-4">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" className="truncate font-semibold">
                {app.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="truncate">
                {maskClientId(app.clientId)}
              </Typography>
              <Typography variant="caption" color="text.secondary" className="block truncate">
                {app.connectionCount} connected account
                {app.connectionCount === 1 ? '' : 's'}
              </Typography>
            </Box>
            {selected ? (
              <Chip
                size="small"
                icon={<CheckCircleOutlineOutlinedIcon />}
                color="success"
                label="Selected"
              />
            ) : (
              <Chip size="small" variant="outlined" label="Use this" />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function ConnectionCard({
  connection,
  selected,
  onSelect,
  onDelete,
  isDeleting,
}: {
  connection: OrganizationGoogleConnection;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  const canDelete = connection.propertyCount === 0;

  return (
    <Card
      variant="outlined"
      className={`rounded-2xl border transition-colors ${
        selected ? 'border-primary-main bg-primary-main/5' : 'border-divider'
      }`}
    >
      <CardContent className="p-4">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CardActionArea
            onClick={onSelect}
            className="flex-1 rounded-2xl"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" className="truncate font-semibold">
                  {connection.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected {formatConnectedDate(connection.connectedAt)}
                </Typography>
              </Box>
              {selected ? (
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon />}
                  color="success"
                  label="Selected"
                />
              ) : (
                <Chip size="small" variant="outlined" label="Use this" />
              )}
            </Stack>
          </CardActionArea>
          {onDelete ? (
            <Tooltip
              title={
                canDelete
                  ? 'Remove account'
                  : 'Unlink this account from all websites first'
              }
            >
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={!canDelete || isDeleting}
                  aria-label={`Remove ${connection.email}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function WebsiteWizardGoogleStep({
  draft,
  canManageIntegrations,
  onSelectOAuthApp,
  onSelectConnection,
  onGoogleConnected,
}: WebsiteWizardGoogleStepProps) {
  const orgSlug = useOrgSlug();
  const { notifySuccess, notifyError } = useNotify();
  const [phase, setPhase] = useState<WizardPhase>(() =>
    draft.selectedOAuthAppId ? 'pickAccount' : 'pickApp',
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    apps,
    isLoading: isAppsLoading,
    createApp,
    isCreating,
    refetch: refetchApps,
  } = useOrganizationGoogleOAuthApps();
  const selectedOAuthAppId = draft.selectedOAuthAppId;
  const effectiveOAuthAppId =
    selectedOAuthAppId ?? (apps.length === 1 ? (apps[0]?.id ?? null) : null);
  const {
    connections,
    isLoading: isConnectionsLoading,
    error: connectionsError,
    deleteConnection,
    isDeleting,
  } = useOrganizationGoogleConnections(effectiveOAuthAppId);

  const effectivePhase: WizardPhase =
    phase === 'pickApp' && effectiveOAuthAppId ? 'pickAccount' : phase;

  const selectedApp = useMemo(
    () => apps.find((app) => app.id === effectiveOAuthAppId) ?? null,
    [apps, effectiveOAuthAppId],
  );
  const selectedConnection = connections.find(
    (connection) => connection.id === draft.selectedConnectionId,
  );

  function handleSelectOAuthApp(oauthAppId: string) {
    onSelectOAuthApp(oauthAppId);
    onSelectConnection(null);
    setPhase('pickAccount');
  }

  async function handleDeleteConnection(connectionId: string) {
    const connection = connections.find((item) => item.id === connectionId);
    if (!connection || connection.propertyCount > 0) {
      return;
    }

    try {
      await deleteConnection(connectionId);
      if (draft.selectedConnectionId === connectionId) {
        onSelectConnection(null);
      }
      notifySuccess(`${connection.email} removed.`);
    } catch (error) {
      notifyError(
        error instanceof Error ? error.message : 'Failed to remove Google account.',
      );
    }
  }

  function handleSelectConnection(connectionId: string) {
    const connection = connections.find((item) => item.id === connectionId);
    if (connection) {
      onSelectOAuthApp(connection.oauthAppId);
    }
    onSelectConnection(connectionId);
    onGoogleConnected?.();
  }

  async function handleConnectGoogle() {
    const oauthAppId = effectiveOAuthAppId;
    if (!oauthAppId) {
      return;
    }

    if (!selectedOAuthAppId && oauthAppId) {
      onSelectOAuthApp(oauthAppId);
    }

    writeWebsiteWizardDraft({
      ...draft,
      selectedOAuthAppId: oauthAppId,
    });
    setIsConnecting(true);
    startOrganizationGoogleOAuth(orgSlug, oauthAppId);
  }

  async function handleOAuthAppSaved(app: GoogleOAuthApp) {
    await refetchApps();
    onSelectOAuthApp(app.id);
    setPhase('pickAccount');
    notifySuccess('OAuth app saved. Connect a Google account to continue.');
  }

  if (!canManageIntegrations) {
    return (
      <Alert severity="info">
        Google integrations require website manage access.
      </Alert>
    );
  }

  if (isAppsLoading) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', py: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      </Stack>
    );
  }

  if (effectivePhase === 'addApp' || apps.length === 0) {
    return (
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Box className="w-full max-w-md text-center">
          <Typography variant="h6" className="font-bold">
            Set up Google OAuth
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Save your Google Cloud OAuth credentials once, then reuse them for
            every website on that Google account.
          </Typography>
        </Box>

        <Box className="w-full max-w-md">
          <WebsiteGoogleOAuthAppForm
            onCreateApp={createApp}
            isSaving={isCreating}
            onSaved={(app) => void handleOAuthAppSaved(app)}
          />
        </Box>

        {apps.length > 0 ? (
          <Button
            variant="text"
            onClick={() => setPhase('pickApp')}
            className="normal-case"
          >
            Back to saved OAuth apps
          </Button>
        ) : null}
      </Stack>
    );
  }

  if (effectivePhase === 'pickApp') {
    return (
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Box className="w-full max-w-md text-center">
          <Typography variant="h6" className="font-bold">
            Choose Google OAuth app
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Pick a saved OAuth client or add a new one for a different Google
            Cloud project.
          </Typography>
        </Box>

        <Stack spacing={1.5} className="w-full max-w-md">
          {apps.map((app) => (
            <OAuthAppCard
              key={app.id}
              app={app}
              selected={draft.selectedOAuthAppId === app.id}
              onSelect={() => handleSelectOAuthApp(app.id)}
            />
          ))}
        </Stack>

        <Button
          variant="outlined"
          onClick={() => setPhase('addApp')}
          className="rounded-xl normal-case"
        >
          Add new OAuth app
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Box className="w-full max-w-md text-center">
        <Typography variant="h6" className="font-bold">
          Sign in with Google
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Using OAuth app <strong>{selectedApp?.label ?? 'Selected'}</strong>.
          Connect a Google account or pick one you already linked.
        </Typography>
      </Box>

      <Stack spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
        <GoogleSignInButton
          loading={isConnecting}
          disabled={!effectiveOAuthAppId}
          onClick={() => void handleConnectGoogle()}
        />
        <Typography variant="caption" color="text.secondary" className="text-center">
          Opens Google sign-in · grants GA4, Search Console & PageSpeed access
        </Typography>
      </Stack>

      {selectedConnection ? (
        <Alert
          severity="success"
          icon={<CheckCircleOutlineOutlinedIcon />}
          className="w-full max-w-md rounded-xl"
        >
          Signed in as <strong>{selectedConnection.email}</strong>. Continue to
          the next step.
        </Alert>
      ) : null}

      {!isConnectionsLoading && connections.length > 0 ? (
        <Stack spacing={1.5} className="w-full max-w-md">
          <Typography variant="subtitle2" className="text-center font-semibold">
            Or pick an account you already connected
          </Typography>
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              selected={draft.selectedConnectionId === connection.id}
              onSelect={() => handleSelectConnection(connection.id)}
              onDelete={() => void handleDeleteConnection(connection.id)}
              isDeleting={isDeleting}
            />
          ))}
        </Stack>
      ) : null}

      {isConnectionsLoading ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading accounts…
          </Typography>
        </Stack>
      ) : null}

      {connectionsError ? (
        <Alert severity="error" className="w-full max-w-md rounded-xl">
          {connectionsError}
        </Alert>
      ) : null}

      <Accordion
        disableGutters
        className="w-full max-w-md rounded-2xl border border-divider shadow-none before:hidden"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" color="text.secondary">
            Change OAuth app or add another
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="px-4 pb-4">
          <Stack spacing={1.5}>
            <Button
              variant="text"
              onClick={() => {
                onSelectOAuthApp(null);
                onSelectConnection(null);
                setPhase('pickApp');
              }}
              className="self-start normal-case"
            >
              Pick a different OAuth app
            </Button>
            <Button
              variant="text"
              onClick={() => setPhase('addApp')}
              className="self-start normal-case"
            >
              Add new OAuth app
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

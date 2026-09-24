'use client';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import FormAlert from '@/components/ui/FormAlert';
import { useNotify } from '@/hooks/useNotify';
import { useWebsiteGoogleOAuthSettings } from '@/hooks/useWebsiteGoogleOAuthSettings';
import { PUBLIC_BACKEND_URL } from '@/lib/api/config';
import type { GoogleOAuthApp } from '@/lib/api/services/website.service';

interface WebsiteGoogleOAuthAppFormProps {
  onSaved?: (app: GoogleOAuthApp) => void;
  onCreateApp: (input: {
    label?: string;
    clientId: string;
    clientSecret: string;
    redirectBaseUrl: string;
  }) => Promise<GoogleOAuthApp>;
  isSaving?: boolean;
}

function buildRedirectUri(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  if (!trimmed) {
    return '';
  }

  return `${trimmed}/website/google-connection/oauth/callback`;
}

export default function WebsiteGoogleOAuthAppForm({
  onSaved,
  onCreateApp,
  isSaving = false,
}: WebsiteGoogleOAuthAppFormProps) {
  const { notifySuccess } = useNotify();
  const { settings, isLoading } = useWebsiteGoogleOAuthSettings();
  const [label, setLabel] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectBaseUrl, setRedirectBaseUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const suggestedBaseUrl =
    settings?.defaultRedirectBaseUrl || PUBLIC_BACKEND_URL || '';

  const effectiveRedirectBaseUrl =
    redirectBaseUrl ?? suggestedBaseUrl;

  const redirectUri = useMemo(
    () => buildRedirectUri(effectiveRedirectBaseUrl),
    [effectiveRedirectBaseUrl],
  );

  async function handleCopyRedirectUri() {
    if (!redirectUri) {
      return;
    }

    await navigator.clipboard.writeText(redirectUri);
    notifySuccess('Redirect URI copied to clipboard.');
  }

  async function handleSave() {
    setSubmitError(null);

    const resolvedClientId = clientId.trim();
    const resolvedRedirectBaseUrl = effectiveRedirectBaseUrl.trim();

    if (!resolvedClientId || !clientSecret.trim() || !resolvedRedirectBaseUrl) {
      setSubmitError('Enter client ID, client secret, and callback base URL.');
      return;
    }

    try {
      const app = await onCreateApp({
        label: label.trim() || undefined,
        clientId: resolvedClientId,
        clientSecret: clientSecret.trim(),
        redirectBaseUrl: resolvedRedirectBaseUrl,
      });
      setClientSecret('');
      onSaved?.(app);
    } catch (saveError) {
      setSubmitError(
        saveError instanceof Error
          ? saveError.message
          : 'Failed to save Google OAuth app.',
      );
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Create a Google Cloud OAuth client, then paste the credentials below.
        {suggestedBaseUrl ? (
          <>
            {' '}
            Callback URL is pre-filled with{' '}
            <strong>{suggestedBaseUrl}</strong>.
          </>
        ) : (
          ' Set the callback base URL to where your backend is reachable.'
        )}
      </Typography>

      <Stack component="ol" spacing={0.5} className="list-decimal pl-5">
        <Typography component="li" variant="body2" color="text.secondary">
          Open{' '}
          <Link
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Cloud Console → Credentials
          </Link>
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Create an OAuth client (Web application)
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Add the redirect URI below under Authorized redirect URIs
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Copy the Client ID and Secret here, then save
        </Typography>
      </Stack>

      <TextField
        label="Label (optional)"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Client A GCP project"
        fullWidth
        helperText="Helps you pick the right OAuth app when adding websites."
      />
      <TextField
        label="OAuth callback base URL"
        value={effectiveRedirectBaseUrl}
        onChange={(event) => setRedirectBaseUrl(event.target.value)}
        placeholder={suggestedBaseUrl || 'https://api.yourdomain.com'}
        fullWidth
        helperText="Must match where your backend is reachable — not the frontend or email tracking URL."
      />
      <TextField
        label="Redirect URI (copy to Google Cloud Console)"
        value={redirectUri}
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Copy redirect URI"
                  onClick={() => void handleCopyRedirectUri()}
                  disabled={!redirectUri}
                  edge="end"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        helperText="Add this exact URI under Authorized redirect URIs"
      />
      <TextField
        label="OAuth client ID"
        value={clientId}
        onChange={(event) => setClientId(event.target.value)}
        placeholder="123456789.apps.googleusercontent.com"
        fullWidth
      />
      <TextField
        label="OAuth client secret"
        type="password"
        value={clientSecret}
        onChange={(event) => setClientSecret(event.target.value)}
        placeholder="Enter client secret"
        fullWidth
      />
      {submitError ? <FormAlert message={submitError} /> : null}
      <Button
        variant="outlined"
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="self-start rounded-xl"
      >
        {isSaving ? 'Saving…' : 'Save OAuth app'}
      </Button>
    </Stack>
  );
}

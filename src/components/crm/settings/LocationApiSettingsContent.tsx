'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import FormAlert from '@/components/ui/FormAlert';
import { useLocationSettings } from '@/hooks/useLocationSearch';
import {
  locationSettingsService,
  type LocationProvider,
  type UpdateLocationSettingsInput,
} from '@/lib/api/services/location.service';

export default function LocationApiSettingsContent() {
  const { data: settings, isLoading, error, refetch } = useLocationSettings();
  const [providerOverride, setProviderOverride] = useState<LocationProvider | null>(
    null,
  );
  const [apiUsername, setApiUsername] = useState('');
  const [apiUrlOverride, setApiUrlOverride] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const provider = providerOverride ?? settings?.provider ?? 'geonames';
  const apiUrl = apiUrlOverride ?? settings?.apiUrl ?? '';

  function buildPayload(): UpdateLocationSettingsInput {
    const payload: UpdateLocationSettingsInput = { provider };

    if (provider === 'geonames' && apiUsername.trim()) {
      payload.apiUsername = apiUsername.trim();
    }

    if (provider === 'custom') {
      payload.apiUrl = apiUrl.trim();
      if (apiKey.trim()) {
        payload.apiKey = apiKey.trim();
      }
    }

    return payload;
  }

  async function handleTest() {
    setSubmitError(null);
    setSuccessMessage(null);
    setIsTesting(true);

    try {
      await locationSettingsService.test(buildPayload());
      setSuccessMessage('Connection successful.');
    } catch (testError) {
      setSubmitError(
        testError instanceof Error
          ? testError.message
          : 'Connection test failed.',
      );
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSave() {
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await locationSettingsService.update(buildPayload());
      setApiUsername('');
      setApiKey('');
      setProviderOverride(null);
      setApiUrlOverride(null);
      await refetch();
      setSuccessMessage('Location API settings saved.');
    } catch (saveError) {
      setSubmitError(
        saveError instanceof Error ? saveError.message : 'Failed to save settings.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="rounded-2xl">
        {error}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="CRM"
        title="Location API"
        description="Configure the location autocomplete provider used by company and prospect location fields."
        parentBack={{ href: '/crm/configuration', label: 'CRM Configuration' }}
        showPlatformBackLink={false}
      />

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-5 md:p-6">
          <Stack spacing={2.5}>
            {settings?.usesPlatformDefault ? (
              <Alert severity="info" className="rounded-2xl">
                This organization is currently using the platform GeoNames
                username. Save org-specific credentials below to override it.
              </Alert>
            ) : null}

            {submitError ? <FormAlert message={submitError} /> : null}
            {successMessage ? (
              <Alert severity="success" className="rounded-xl">
                {successMessage}
              </Alert>
            ) : null}

            <TextField
              select
              label="Provider"
              value={provider}
              onChange={(event) =>
                setProviderOverride(event.target.value as LocationProvider)
              }
              fullWidth
            >
              <MenuItem value="geonames">GeoNames (free username)</MenuItem>
              <MenuItem value="custom">Custom API</MenuItem>
            </TextField>

            {provider === 'geonames' ? (
              <TextField
                label="GeoNames username"
                value={apiUsername}
                onChange={(event) => setApiUsername(event.target.value)}
                placeholder={
                  settings?.apiUsernameMasked
                    ? `Saved: ${settings.apiUsernameMasked}`
                    : 'Enter GeoNames username'
                }
                helperText="Register free at geonames.org. Leave blank to keep the saved or platform default username."
                fullWidth
              />
            ) : (
              <>
                <TextField
                  label="Custom API URL"
                  value={apiUrl}
                  onChange={(event) => setApiUrlOverride(event.target.value)}
                  placeholder="https://api.example.com/location/search"
                  helperText="Must accept q, components, and trigger query params and return { results: [{ displayLabel, city?, state?, country?, region? }] }."
                  fullWidth
                />
                <TextField
                  label="API key"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={
                    settings?.apiKeyMasked
                      ? `Saved: ${settings.apiKeyMasked}`
                      : 'Optional bearer token'
                  }
                  fullWidth
                />
              </>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => void handleTest()}
                disabled={isTesting || isSaving}
              >
                {isTesting ? 'Testing…' : 'Test connection'}
              </Button>
              <Button
                variant="contained"
                onClick={() => void handleSave()}
                disabled={isSaving || isTesting}
              >
                {isSaving ? 'Saving…' : 'Save settings'}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Status:{' '}
              {settings?.isConfigured
                ? 'Configured and ready for location autocomplete'
                : 'Not configured — location fields will show a setup warning'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGooglePropertySuggestions } from '@/hooks/useGooglePropertySuggestions';
import { useWebsitePsiSettings } from '@/hooks/useWebsitePsiSettings';
import type { WebsiteWizardDraft } from '@/lib/website/wizard-session';

interface WebsiteWizardIntegrationsStepProps {
  draft: WebsiteWizardDraft;
  canManageIntegrations: boolean;
  onChange: (patch: Partial<WebsiteWizardDraft>) => void;
}

export default function WebsiteWizardIntegrationsStep({
  draft,
  canManageIntegrations,
  onChange,
}: WebsiteWizardIntegrationsStepProps) {
  const { settings: psiSettings } = useWebsitePsiSettings();
  const googleConnected = Boolean(draft.selectedConnectionId);
  const { suggestions, isLoading, error } = useGooglePropertySuggestions(
    draft.domain,
    {
      propertyId: draft.propertyId,
      connectionId: draft.selectedConnectionId,
      enabled: googleConnected && draft.domain.trim().length >= 3,
    },
  );

  const psiAuthAvailable = googleConnected || Boolean(psiSettings?.hasApiKey);

  const resolvedGa4PropertyId =
    draft.ga4PropertyId ||
    (draft.ga4Enabled ? (suggestions?.ga4.suggested?.propertyId ?? '') : '');
  const resolvedGscSiteUrl =
    draft.gscSiteUrl ||
    (draft.gscEnabled ? (suggestions?.gsc.suggested?.siteUrl ?? '') : '');

  function handleGa4PropertyChange(nextPropertyId: string) {
    const match = suggestions?.ga4.candidates.find(
      (candidate) => candidate.propertyId === nextPropertyId,
    );
    onChange({
      ga4PropertyId: nextPropertyId,
      ga4PropertyName: match?.propertyName ?? '',
    });
  }

  if (!canManageIntegrations) {
    return (
      <Alert severity="info">
        Google and PageSpeed integrations require website manage access.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" className="font-semibold">
          Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Enable Google Analytics, Search Console, and PageSpeed for this website.
        </Typography>
      </Box>

      {isLoading ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading Google property suggestions…
          </Typography>
        </Stack>
      ) : null}

      {error ? <Alert severity="warning">{error}</Alert> : null}

      <FormControlLabel
        control={
          <Switch
            checked={draft.ga4Enabled}
            onChange={(event) => onChange({ ga4Enabled: event.target.checked })}
            disabled={!googleConnected}
          />
        }
        label="Google Analytics 4 (GA4)"
      />
      {draft.ga4Enabled ? (
        <TextField
          select
          label="GA4 property"
          value={resolvedGa4PropertyId}
          onChange={(event) => handleGa4PropertyChange(event.target.value)}
          fullWidth
          required
          disabled={!googleConnected || (suggestions?.ga4.candidates.length ?? 0) === 0}
          helperText={
            suggestions?.ga4.suggested &&
            resolvedGa4PropertyId === suggestions.ga4.suggested.propertyId
              ? 'Auto-matched from your domain'
              : 'Select a property from the connected Google account'
          }
        >
          {(suggestions?.ga4.candidates ?? []).map((candidate) => (
            <MenuItem key={candidate.propertyId} value={candidate.propertyId}>
              {candidate.propertyName} ({candidate.accountName})
            </MenuItem>
          ))}
        </TextField>
      ) : null}

      <FormControlLabel
        control={
          <Switch
            checked={draft.gscEnabled}
            onChange={(event) => onChange({ gscEnabled: event.target.checked })}
            disabled={!googleConnected}
          />
        }
        label="Google Search Console (GSC)"
      />
      {draft.gscEnabled ? (
        <TextField
          select
          label="Search Console site"
          value={resolvedGscSiteUrl}
          onChange={(event) => onChange({ gscSiteUrl: event.target.value })}
          fullWidth
          required
          disabled={!googleConnected || (suggestions?.gsc.candidates.length ?? 0) === 0}
          helperText={
            suggestions?.gsc.suggested &&
            resolvedGscSiteUrl === suggestions.gsc.suggested.siteUrl
              ? 'Auto-matched from your domain'
              : 'Select a site from the connected Google account'
          }
        >
          {(suggestions?.gsc.candidates ?? []).map((candidate) => (
            <MenuItem key={candidate.siteUrl} value={candidate.siteUrl}>
              {candidate.siteUrl}
            </MenuItem>
          ))}
        </TextField>
      ) : null}

      <FormControlLabel
        control={
          <Switch
            checked={draft.psiEnabled}
            onChange={(event) => onChange({ psiEnabled: event.target.checked })}
          />
        }
        label="PageSpeed Insights (PSI)"
      />
      {draft.psiEnabled && !psiAuthAvailable ? (
        <Alert severity="warning">
          Connect Google for this website or configure a PageSpeed Insights API key
          above.
        </Alert>
      ) : null}
      {draft.psiEnabled && psiAuthAvailable ? (
        <Typography variant="body2" color="text.secondary">
          Uses this website&apos;s Google OAuth or your organization API key for
          PageSpeed checks.
        </Typography>
      ) : null}
    </Stack>
  );
}
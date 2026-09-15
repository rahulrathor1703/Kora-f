'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import FormAlert from '@/components/ui/FormAlert';
import { useWebsitePsiSettings } from '@/hooks/useWebsitePsiSettings';

export default function PsiApiKeySettingsCard({
  canManageIntegrations = false,
}: {
  canManageIntegrations?: boolean;
}) {
  const { settings, isLoading, updateSettings, testSettings, isSaving, isTesting } =
    useWebsitePsiSettings();
  const [apiKey, setApiKey] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleTest() {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await testSettings(apiKey.trim() ? { apiKey: apiKey.trim() } : {});
      setSuccessMessage('PageSpeed Insights connection successful.');
    } catch (testError) {
      setSubmitError(
        testError instanceof Error
          ? testError.message
          : 'Connection test failed.',
      );
    }
  }

  async function handleSave() {
    setSubmitError(null);
    setSuccessMessage(null);

    if (!apiKey.trim()) {
      setSubmitError('Enter an API key to save.');
      return;
    }

    try {
      await updateSettings({ apiKey: apiKey.trim() });
      setApiKey('');
      setSuccessMessage('PageSpeed Insights API key saved.');
    } catch (saveError) {
      setSubmitError(
        saveError instanceof Error ? saveError.message : 'Failed to save API key.',
      );
    }
  }

  return (
    <Accordion
      disableGutters
      className="dashboard-panel surface-panel rounded-2xl shadow-none before:hidden"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack spacing={0.5}>
          <Typography variant="overline" className="font-semibold tracking-[0.14em] text-primary">
            PageSpeed Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Optional API key for higher quota. Each website can also use its own Google OAuth connection.
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails className="px-5 pb-5 md:px-6 md:pb-6">
        {isLoading ? (
          <Stack direction="row" className="py-4" sx={{ justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {settings?.hasApiKey ? (
              <Alert severity="success" className="rounded-xl">
                An API key is configured for this organization.
              </Alert>
            ) : null}

            {canManageIntegrations ? (
              <>
                <TextField
                  label="PageSpeed Insights API key"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Enter a new API key"
                  fullWidth
                  helperText="Leave blank to test using a saved API key."
                />

                {submitError ? <FormAlert message={submitError} /> : null}
                {successMessage ? (
                  <Alert severity="success" className="rounded-xl">
                    {successMessage}
                  </Alert>
                ) : null}

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={() => void handleTest()}
                    disabled={isTesting || isSaving}
                    className="rounded-xl"
                  >
                    {isTesting ? 'Testing…' : 'Test connection'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={isSaving || isTesting || !apiKey.trim()}
                    className="rounded-xl"
                  >
                    {isSaving ? 'Saving…' : 'Save API key'}
                  </Button>
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                PageSpeed API key settings require website manage access.
              </Typography>
            )}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

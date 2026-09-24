'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import BantCriteriaEditor from '@/components/crm/bant/BantCriteriaEditor';
import BantScorePreview from '@/components/crm/bant/BantScorePreview';
import BantTierThresholdsEditor from '@/components/crm/bant/BantTierThresholdsEditor';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import FormAlert from '@/components/ui/FormAlert';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useBantSettings } from '@/hooks/useBantSettings';
import { getApiErrorMessage } from '@/lib/api';
import type { BantSettingsConfig } from '@/lib/crm/bant/types';

export default function BantSettingsContent() {
  const canManage = useHasPermission('bant-settings:manage');
  const { config, isLoading, isSaving, error, saveSettings } = useBantSettings();
  const [draft, setDraft] = useState<BantSettingsConfig | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const workingConfig = draft ?? config;
  const isDirty =
    draft !== null &&
    config !== null &&
    JSON.stringify(draft) !== JSON.stringify(config);

  async function handleSave() {
    if (!workingConfig) {
      return;
    }

    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await saveSettings(workingConfig);
      setDraft(null);
      setSuccessMessage('BANT settings saved.');
    } catch (saveErr) {
      setSubmitError(getApiErrorMessage(saveErr, 'Unable to save BANT settings.'));
    }
  }

  if (isLoading && !workingConfig) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!workingConfig) {
    return (
      <Typography variant="body2" color="text.secondary">
        Unable to load BANT settings.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="CRM Configuration"
        title="BANT Settings"
        description="Configure qualification criteria, option points, weights, and tier thresholds used on prospect BANT tabs."
        parentBack={{ href: '/crm/configuration', label: 'CRM Configuration' }}
        showPlatformBackLink={false}
      />

      {error ? (
        <FormAlert message={getApiErrorMessage(error, 'Unable to load BANT settings.')} />
      ) : null}

      {!canManage ? (
        <Alert severity="info">
          You have read-only access to BANT settings. Contact an admin to make
          changes.
        </Alert>
      ) : null}

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-5 md:p-6">
          <Typography
            variant="overline"
            className="mb-3 block font-semibold tracking-[0.14em] text-primary"
          >
            Criteria
          </Typography>
          <BantCriteriaEditor
            config={workingConfig}
            onChange={setDraft}
            readOnly={!canManage}
          />
        </CardContent>
      </Card>

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-5 md:p-6">
          <Typography
            variant="overline"
            className="mb-3 block font-semibold tracking-[0.14em] text-primary"
          >
            Tier thresholds
          </Typography>
          <BantTierThresholdsEditor
            tiers={workingConfig.tiers}
            onChange={(tiers) =>
              setDraft({ ...workingConfig, tiers })
            }
            readOnly={!canManage}
          />
        </CardContent>
      </Card>

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-5 md:p-6">
          <Typography
            variant="overline"
            className="mb-3 block font-semibold tracking-[0.14em] text-primary"
          >
            Score preview
          </Typography>
          <BantScorePreview
            key={JSON.stringify(workingConfig)}
            config={workingConfig}
          />
        </CardContent>
      </Card>

      {submitError ? <FormAlert message={submitError} /> : null}
      {successMessage ? (
        <Alert severity="success" className="rounded-xl">
          {successMessage}
        </Alert>
      ) : null}

      {canManage ? (
        <Box className="flex justify-end">
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save settings'}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}

'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import FormAlert from '@/components/ui/FormAlert';
import { useCampaignIdFormat } from '@/hooks/useCampaignIdFormat';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import { generatePreviewCampaignId } from '@/lib/email/campaign-id-format/generate-preview';

export default function CampaignIdFormatSettingsContent() {
  const toOrgPath = useOrgPath();
  const canManage = useHasPermission('email-config:manage');
  const {
    data,
    isLoading,
    error: fetchError,
    setFormat,
    isSettingFormat,
    setFormatError,
  } = useCampaignIdFormat(true);

  const [draftFormat, setDraftFormat] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLocked = data?.locked ?? false;
  const formatValue = isLocked ? (data?.format ?? '') : draftFormat;
  const trimmedFormat = formatValue.trim();

  const previewError = useMemo(() => {
    if (!trimmedFormat) {
      return null;
    }

    try {
      generatePreviewCampaignId(trimmedFormat);
      return null;
    } catch (previewErr) {
      return previewErr instanceof Error
        ? previewErr.message
        : 'Invalid format';
    }
  }, [trimmedFormat]);

  const preview = useMemo(() => {
    if (!trimmedFormat || previewError) {
      return '';
    }

    return generatePreviewCampaignId(trimmedFormat);
  }, [trimmedFormat, previewError]);

  const canSubmit =
    canManage &&
    !isLocked &&
    trimmedFormat.length > 0 &&
    !previewError &&
    !isSettingFormat;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setSubmitError(null);

    try {
      await setFormat({ format: trimmedFormat });
    } catch (saveErr) {
      setSubmitError(
        getApiErrorMessage(saveErr, 'Unable to save campaign ID format.'),
      );
    }
  }

  if (isLoading) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Email settings"
        title="Campaign ID format"
        description="Set how automatic campaign IDs are generated when a new campaign is created. This is a one-time setup for your organization."
        parentBack={{
          href: toOrgPath('/email/settings'),
          label: 'Email settings',
        }}
      />

      {fetchError ? (
        <FormAlert
          message={getApiErrorMessage(fetchError, 'Unable to load settings.')}
        />
      ) : null}

      {setFormatError ? (
        <FormAlert
          message={getApiErrorMessage(
            setFormatError,
            'Unable to save campaign ID format.',
          )}
        />
      ) : null}

      {submitError ? <FormAlert message={submitError} /> : null}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              Use letters and digits as placeholders. For example,{' '}
              <Typography component="span" className="font-mono font-medium">
                DD98392NHNA0
              </Typography>{' '}
              creates 2 letters, 5 digits, 4 letters, and 1 digit. Hyphens and
              other symbols stay fixed in every ID.
            </Alert>

            <TextField
              label="ID format"
              value={formatValue}
              onChange={(event) => setDraftFormat(event.target.value)}
              disabled={isLocked || !canManage}
              fullWidth
              slotProps={{
                htmlInput: { maxLength: 128, className: 'font-mono' },
              }}
              helperText={
                isLocked
                  ? 'Format is locked after the first save.'
                  : 'Save once to enable campaign creation.'
              }
            />

            {preview ? (
              <Box>
                <Typography variant="body2" className="text-muted">
                  Sample ID
                </Typography>
                <Typography className="font-mono text-lg font-semibold">
                  {preview}
                </Typography>
              </Box>
            ) : null}

            {previewError ? (
              <Alert severity="warning">{previewError}</Alert>
            ) : null}

            {!canManage ? (
              <Alert severity="warning">
                You need email configuration manage permission to set the
                format.
              </Alert>
            ) : null}

            <Box className="flex justify-end">
              <Button
                variant="contained"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
              >
                {isSettingFormat ? 'Saving…' : 'Save format'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

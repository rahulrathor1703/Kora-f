'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import SaveAsTemplateDialog from '@/components/email/campaigns/create/sequence/SaveAsTemplateDialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useNotify } from '@/hooks/useNotify';
import {
  getSaveTemplateValidationError,
  mapWizardFormToCreateTemplateInput,
  type SaveTemplateScope,
} from '@/lib/email/campaigns/template-mapping';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

interface SaveAsTemplateBarProps {
  onTemplateSaved?: () => Promise<unknown>;
}

export default function SaveAsTemplateBar({
  onTemplateSaved,
}: SaveAsTemplateBarProps) {
  const { getValues, setValue } = useFormContext<CampaignWizardFormValues>();
  const { createTemplate, isCreating } = useEmailTemplates({ type: 'sequence' });
  const { notifySuccess, notifyError } = useNotify();
  const [templateName, setTemplateName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const trimmedName = templateName.trim();
  const canOpenDialog = Boolean(trimmedName) && !isCreating;

  function handleOpenDialog() {
    if (!canOpenDialog) {
      return;
    }

    setDialogOpen(true);
  }

  function handleCloseDialog() {
    if (isCreating) {
      return;
    }

    setDialogOpen(false);
  }

  async function handleConfirm(scope: SaveTemplateScope) {
    const values = getValues();
    const validationError = getSaveTemplateValidationError(
      {
        initialOutreach: values.initialOutreach,
        followUps: values.followUps,
      },
      { name: trimmedName, scope },
    );

    if (validationError) {
      notifyError(validationError);
      return;
    }

    try {
      const payload = mapWizardFormToCreateTemplateInput(
        {
          initialOutreach: values.initialOutreach,
          followUps: values.followUps,
        },
        { name: trimmedName, scope },
      );
      const created = await createTemplate(payload);

      await onTemplateSaved?.();

      notifySuccess(`Template "${trimmedName}" saved`);
      setTemplateName('');
      setDialogOpen(false);

      if (scope === 'sequence' && created?.id) {
        setValue('selectedSequenceTemplateId', created.id, { shouldDirty: true });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save template';
      notifyError(message);
    }
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'flex-start' } }}
      >
        <TextField
          label="Template name"
          placeholder="e.g. Insurance ops outreach"
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          disabled={isCreating}
          size="small"
          fullWidth
          className="rounded-xl"
        />
        <Button
          variant="outlined"
          onClick={handleOpenDialog}
          disabled={!canOpenDialog}
          className="shrink-0 rounded-xl"
          sx={{ minWidth: { sm: 160 } }}
        >
          Save as template
        </Button>
      </Stack>

      <SaveAsTemplateDialog
        open={dialogOpen}
        templateName={trimmedName}
        isSaving={isCreating}
        onClose={handleCloseDialog}
        onConfirm={(scope) => void handleConfirm(scope)}
      />
    </>
  );
}

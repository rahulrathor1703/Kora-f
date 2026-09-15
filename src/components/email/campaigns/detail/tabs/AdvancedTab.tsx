'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  AdvancedFieldsForm,
  type CampaignAdvancedFieldValues,
} from '@/components/email/campaigns/shared/CampaignAdvancedFieldsDrawer';

interface AdvancedTabProps {
  canUpdate?: boolean;
  initialValues?: CampaignAdvancedFieldValues;
  onSave?: (values: CampaignAdvancedFieldValues) => Promise<void>;
  isSaving?: boolean;
  canDirectDelete?: boolean;
  canRequestDelete?: boolean;
  hasPendingDeleteRequest?: boolean;
  pendingDeleteRequestLabel?: string;
  onDirectDelete?: () => void;
  onRequestDelete?: () => void;
  isDeleting?: boolean;
}

export default function AdvancedTab({
  canUpdate = false,
  initialValues,
  onSave,
  isSaving = false,
  canDirectDelete = false,
  canRequestDelete = false,
  hasPendingDeleteRequest = false,
  pendingDeleteRequestLabel,
  onDirectDelete,
  onRequestDelete,
  isDeleting = false,
}: AdvancedTabProps) {
  const [values, setValues] = useState<CampaignAdvancedFieldValues>(
    initialValues ?? { type: '', brand: '', region: '', customFieldValues: {} },
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const showClassification = canUpdate && initialValues && onSave;
  const showDeleteActions =
    (canDirectDelete && onDirectDelete) || (canRequestDelete && onRequestDelete);

  function handleChange(field: 'type' | 'brand' | 'region', value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleCustomFieldChange(fieldDefinitionId: string, value: string) {
    setValues((current) => ({
      ...current,
      customFieldValues: {
        ...current.customFieldValues,
        [fieldDefinitionId]: value,
      },
    }));
  }

  function handleReset() {
    if (!initialValues) {
      return;
    }

    setValues(initialValues);
    setSaveError(null);
  }

  async function handleSave() {
    if (!onSave) {
      return;
    }

    setSaveError(null);

    try {
      await onSave(values);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save advanced fields. Please try again.',
      );
    }
  }

  return (
    <Stack spacing={3}>
      {showClassification ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-6">
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" className="font-bold">
                  Classification
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  Optional campaign classification
                </Typography>
              </Box>

              <AdvancedFieldsForm
                values={values}
                onChange={handleChange}
                onCustomFieldChange={handleCustomFieldChange}
              />

              {saveError ? (
                <Alert severity="error" className="rounded-2xl">
                  {saveError}
                </Alert>
              ) : null}

              <Stack direction="row" spacing={1.5} className="justify-end">
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="rounded-xl normal-case"
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="rounded-xl normal-case shadow-none"
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {showDeleteActions ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-6">
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6" className="font-bold">
                  Delete campaign
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  {canDirectDelete
                    ? 'Permanently remove this campaign and all associated data.'
                    : 'Submit a request for an administrator to delete this campaign.'}
                </Typography>
              </Box>

              {hasPendingDeleteRequest && pendingDeleteRequestLabel ? (
                <Chip
                  size="small"
                  label={pendingDeleteRequestLabel}
                  color="warning"
                  variant="outlined"
                  className="self-start rounded-lg"
                />
              ) : null}

              <Divider />

              <Stack direction="row" spacing={1.5} className="flex-wrap">
                {canDirectDelete && onDirectDelete ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={onDirectDelete}
                    disabled={isDeleting}
                    className="rounded-xl normal-case"
                  >
                    Delete
                  </Button>
                ) : null}
                {canRequestDelete && onRequestDelete ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={onRequestDelete}
                    disabled={hasPendingDeleteRequest}
                    className="rounded-xl normal-case"
                  >
                    {hasPendingDeleteRequest ? 'Delete request pending' : 'Request delete'}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

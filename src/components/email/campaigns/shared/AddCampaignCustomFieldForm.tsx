'use client';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import type { CampaignCustomFieldType } from '@/lib/email/campaigns/custom-field-types';

interface AddCampaignCustomFieldFormProps {
  onCreateDefinition: (input: {
    label: string;
    type: CampaignCustomFieldType;
  }) => Promise<void>;
  isCreating?: boolean;
}

export default function AddCampaignCustomFieldForm({
  onCreateDefinition,
  isCreating = false,
}: AddCampaignCustomFieldFormProps) {
  const { notifyError } = useNotify();
  const canManage = useHasPermission('email-campaigns:create');
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CampaignCustomFieldType>('select');

  if (!canManage) {
    return null;
  }

  async function handleSubmit() {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }

    try {
      await onCreateDefinition({ label: trimmed, type });
      setLabel('');
      setType('select');
      setExpanded(false);
    } catch (error) {
      notifyError(
        error instanceof Error ? error.message : 'Unable to add custom field',
      );
    }
  }

  return (
    <Box className="rounded-2xl border border-dashed border-gray-200 p-4">
      <Button
        size="small"
        variant="text"
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={() => setExpanded((current) => !current)}
        className="min-w-0 normal-case"
      >
        Add custom field
      </Button>

      <Collapse in={expanded}>
        <Stack spacing={2} className="mt-3">
          <Typography variant="body2" color="text.secondary">
            Create a reusable field for your organization. Dropdown fields support
            inline option creation; text fields accept free-form values per campaign.
          </Typography>

          <TextField
            size="small"
            fullWidth
            label="Field label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Department"
            disabled={isCreating}
            className="rounded-xl"
          />

          <TextField
            select
            size="small"
            fullWidth
            label="Field type"
            value={type}
            onChange={(event) => setType(event.target.value as CampaignCustomFieldType)}
            disabled={isCreating}
            className="rounded-xl"
          >
            <MenuItem value="select">Dropdown</MenuItem>
            <MenuItem value="text">Free text</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1} className="justify-end">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setExpanded(false)}
              disabled={isCreating}
              className="rounded-xl normal-case"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={!label.trim() || isCreating}
              onClick={() => void handleSubmit()}
              className="rounded-xl normal-case shadow-none"
            >
              {isCreating ? 'Adding…' : 'Add field'}
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Box>
  );
}

'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { CustomFieldEntity } from '@/components/crm/fields/AddCustomFieldDialog';
import { slugifySectionKey } from '@/lib/crm/fields/section-field.utils';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export type SectionFieldDefinition =
  | CompanyFieldDefinition
  | ProspectFieldDefinition;

interface AddSectionDialogProps {
  open: boolean;
  entity: CustomFieldEntity;
  sortOrder: number;
  onClose: () => void;
  onConfirm: (field: SectionFieldDefinition) => void;
}

function buildSectionField(
  entity: CustomFieldEntity,
  sortOrder: number,
  label: string,
): SectionFieldDefinition {
  const trimmedLabel = label.trim();

  return {
    id: crypto.randomUUID(),
    key: slugifySectionKey(trimmedLabel),
    label: trimmedLabel,
    type: 'section',
    sortOrder,
    showInTable: false,
    showInForm: true,
    filterable: false,
    required: false,
    editableOnDetail: entity === 'company',
  } as SectionFieldDefinition;
}

export default function AddSectionDialog({
  open,
  entity,
  sortOrder,
  onClose,
  onConfirm,
}: AddSectionDialogProps) {
  const [label, setLabel] = useState('');

  function resetForm() {
    setLabel('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleConfirm() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }

    onConfirm(buildSectionField(entity, sortOrder, trimmedLabel));
    resetForm();
  }

  const canConfirm = label.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add section</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} className="pt-1">
          <Typography variant="body2" color="text.secondary">
            Sections group related fields under a header on create and edit forms.
          </Typography>
          <TextField
            label="Section title"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Personal Information"
            autoFocus
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!canConfirm}>
          Add section
        </Button>
      </DialogActions>
    </Dialog>
  );
}

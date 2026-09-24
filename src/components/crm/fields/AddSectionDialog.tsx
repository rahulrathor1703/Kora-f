'use client';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import type { CustomFieldEntity } from '@/components/crm/fields/AddCustomFieldDialog';
import FormBuilderConfigDialog from '@/components/forms/FormBuilderConfigDialog';
import { slugifySectionKey } from '@/lib/crm/fields/section-field.utils';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import { formBuilderFieldClassName } from '@/lib/forms/form-builder-dialog.styles';

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
    <FormBuilderConfigDialog
      key={open ? 'section-active' : 'section-inactive'}
      open={open}
      kind="section"
      title="Add section"
      subtitle="Sections group related fields under a header on create and edit forms."
      confirmLabel="Add section"
      confirmDisabled={!canConfirm}
      onClose={handleClose}
      onConfirm={handleConfirm}
      propertiesContent={
        <Stack spacing={2.5}>
          <TextField
            label="Section title"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Personal information"
            autoFocus
            fullWidth
            required
            className={formBuilderFieldClassName}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canConfirm) {
                event.preventDefault();
                handleConfirm();
              }
            }}
          />
        </Stack>
      }
    />
  );
}

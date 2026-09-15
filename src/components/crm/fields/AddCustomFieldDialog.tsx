'use client';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import LocationInputModeSelector from '@/components/crm/location/LocationInputModeSelector';
import type { CompanyFieldDefinition, CompanyFieldType } from '@/lib/crm/companies/types';
import {
  DEFAULT_LOCATION_COMPONENTS,
  normalizeLocationInputMode,
  type LocationInputMode,
} from '@/lib/crm/location/types';
import { defaultFormColSpan } from '@/lib/crm/fields/form-layout.utils';
import type {
  ProspectFieldDefinition,
  ProspectFieldType,
} from '@/lib/crm/prospects/types';
import { slugifyLabel as slugifyCompanyLabel } from '@/lib/schemas/company-config-option';

export type CustomFieldEntity = 'company' | 'prospect';

const COMPANY_FIELD_TYPES: CompanyFieldType[] = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'number',
  'date',
  'location',
];

const PROSPECT_FIELD_TYPES: ProspectFieldType[] = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'multiselect',
  'number',
  'date',
  'location',
];

function isOptionsFieldType(type: CompanyFieldType | ProspectFieldType): boolean {
  return type === 'select' || type === 'multiselect';
}

export type CustomFieldDefinition =
  | CompanyFieldDefinition
  | ProspectFieldDefinition;

interface AddCustomFieldDialogProps {
  open: boolean;
  entity: CustomFieldEntity;
  sortOrder: number;
  sectionId?: string;
  onClose: () => void;
  onConfirm: (field: CustomFieldDefinition) => void;
}

function slugifyProspectLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function buildCustomField(
  entity: CustomFieldEntity,
  sortOrder: number,
  label: string,
  type: CompanyFieldType | ProspectFieldType,
  required: boolean,
  locationInputMode: LocationInputMode,
  sectionId?: string,
): CustomFieldDefinition {
  const trimmedLabel = label.trim();
  const key =
    entity === 'company'
      ? slugifyCompanyLabel(trimmedLabel)
      : slugifyProspectLabel(trimmedLabel);

  const base = {
    id: crypto.randomUUID(),
    key,
    label: trimmedLabel,
    sortOrder,
    showInTable: true,
    showInForm: true,
    filterable: isOptionsFieldType(type),
    required,
    editableOnDetail: entity === 'company',
    formColSpan: defaultFormColSpan(type),
    ...(sectionId ? { sectionId } : {}),
  };

  if (type === 'location') {
    return {
      ...base,
      type: 'location',
      locationComponents: [...DEFAULT_LOCATION_COMPONENTS],
      locationInputMode: normalizeLocationInputMode(locationInputMode),
      filterable: false,
    } as CustomFieldDefinition;
  }

  if (type === 'select' || type === 'multiselect') {
    return {
      ...base,
      type,
      options: [{ value: '', label: '' }],
    } as CustomFieldDefinition;
  }

  return {
    ...base,
    type,
    filterable: false,
  } as CustomFieldDefinition;
}

export default function AddCustomFieldDialog({
  open,
  entity,
  sortOrder,
  sectionId,
  onClose,
  onConfirm,
}: AddCustomFieldDialogProps) {
  const fieldTypes =
    entity === 'company' ? COMPANY_FIELD_TYPES : PROSPECT_FIELD_TYPES;
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CompanyFieldType | ProspectFieldType>('text');
  const [required, setRequired] = useState(false);
  const [locationInputMode, setLocationInputMode] =
    useState<LocationInputMode>('api');

  function resetForm() {
    setLabel('');
    setType('text');
    setRequired(false);
    setLocationInputMode('api');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handlePrimaryConfirm() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }

    onConfirm(
      buildCustomField(
        entity,
        sortOrder,
        trimmedLabel,
        type,
        required,
        locationInputMode,
        sectionId,
      ),
    );
    resetForm();
  }

  const canConfirm = label.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add custom field</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} className="pt-1">
          <TextField
            label="Field label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. LinkedIn URL"
            autoFocus
            fullWidth
          />
          <TextField
            select
            label="Type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as CompanyFieldType | ProspectFieldType)
            }
            fullWidth
          >
            {fieldTypes.map((fieldType) => (
              <MenuItem key={fieldType} value={fieldType}>
                {fieldType}
              </MenuItem>
            ))}
          </TextField>
          {type === 'location' ? (
            <LocationInputModeSelector
              value={locationInputMode}
              onChange={setLocationInputMode}
            />
          ) : null}
          <FormControlLabel
            control={
              <Checkbox
                checked={required}
                onChange={(event) => setRequired(event.target.checked)}
              />
            }
            label="Required"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handlePrimaryConfirm}
          disabled={!canConfirm}
        >
          Add field
        </Button>
      </DialogActions>
    </Dialog>
  );
}

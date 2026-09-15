'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { resolveFormColSpan } from '@/lib/crm/fields/form-layout.utils';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import {
  isFormFieldPropertiesEditable,
  isPlatformLockedField,
} from '@/lib/forms/field-rules';
import type { FormEditorMode, FormFieldDefinition, FormFieldType } from '@/lib/forms/types';

const PLATFORM_FIELD_TYPES: FormFieldType[] = [
  'text',
  'email',
  'phone',
  'password',
  'textarea',
  'select',
  'multiselect',
  'number',
  'date',
  'checkbox',
  'location',
  'company-category',
  'company-location',
  'section',
  'rich-text',
  'role-picker',
  'permission-matrix',
  'prospect-search',
  'list-picker',
  'mailbox-picker',
  'color',
];

const ORG_FIELD_TYPES: FormFieldType[] = [
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

function isOptionsFieldType(type: FormFieldType): boolean {
  return type === 'select' || type === 'multiselect';
}

interface FormFieldPropertiesPanelProps {
  field: FormFieldDefinition | null;
  mode: FormEditorMode;
  fieldKeysInUse?: string[];
  onUpdate: (patch: Partial<FormFieldDefinition>) => void;
  readOnly?: boolean;
}

export default function FormFieldPropertiesPanel({
  field,
  mode,
  fieldKeysInUse = [],
  onUpdate,
  readOnly = false,
}: FormFieldPropertiesPanelProps) {
  if (!field) {
    return (
      <Paper className="h-full min-h-[320px] rounded-2xl p-4">
        <Typography variant="body2" color="text.secondary">
          Select a field to edit its properties.
        </Typography>
      </Paper>
    );
  }

  const editable = !readOnly && isFormFieldPropertiesEditable(field, mode);
  const platformLocked = isPlatformLockedField(field, mode);
  const fieldTypes = mode === 'platform' ? PLATFORM_FIELD_TYPES : ORG_FIELD_TYPES;
  const keyInUse = fieldKeysInUse.includes(field.key);
  const isSection = isSectionFieldType(field.type);

  return (
    <Paper className="h-full min-h-[320px] rounded-2xl p-4">
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2">Properties</Typography>
          <Typography variant="caption" color="text.secondary">
            {field.key} · {field.type}
          </Typography>
        </Box>

        {platformLocked ? (
          <Alert severity="info" className="rounded-xl">
            Platform field — read-only in organization mode.
          </Alert>
        ) : null}

        {field.system && mode === 'platform' ? (
          <Alert severity="warning" className="rounded-xl">
            System field — editable in platform mode. Changes affect all tenants.
          </Alert>
        ) : null}

        {keyInUse && mode === 'platform' ? (
          <Alert severity="warning" className="rounded-xl">
            Existing records use this field key. Key changes may affect stored data.
          </Alert>
        ) : null}

        <TextField
          label="Label"
          value={field.label}
          onChange={(event) => onUpdate({ label: event.target.value })}
          fullWidth
          disabled={!editable}
        />

        {!isSection ? (
          <>
            <TextField
              label="Key"
              value={field.key}
              onChange={(event) => onUpdate({ key: event.target.value })}
              fullWidth
              disabled={!editable || (field.system && mode !== 'platform')}
            />

            {editable ? (
              <TextField
                select
                label="Type"
                value={field.type}
                onChange={(event) =>
                  onUpdate({ type: event.target.value as FormFieldType })
                }
                fullWidth
              >
                {fieldTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            <TextField
              label="Placeholder"
              value={field.placeholder ?? ''}
              onChange={(event) =>
                onUpdate({ placeholder: event.target.value || undefined })
              }
              fullWidth
              disabled={!editable}
            />

            <TextField
              label="Help text"
              value={field.helpText ?? ''}
              onChange={(event) =>
                onUpdate({ helpText: event.target.value || undefined })
              }
              fullWidth
              disabled={!editable}
            />

            <TextField
              label="Form column span (1–12)"
              type="number"
              value={resolveFormColSpan(field)}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10);
                if (Number.isFinite(parsed)) {
                  onUpdate({
                    formColSpan: Math.min(12, Math.max(1, parsed)),
                  });
                }
              }}
              fullWidth
              disabled={!editable}
              slotProps={{ htmlInput: { min: 1, max: 12 } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.required ?? false}
                  onChange={(event) =>
                    onUpdate({ required: event.target.checked })
                  }
                  disabled={!editable}
                />
              }
              label="Required"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.showInForm ?? true}
                  onChange={(event) =>
                    onUpdate({ showInForm: event.target.checked })
                  }
                  disabled={!editable}
                />
              }
              label="Show in form"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.showInTable ?? false}
                  onChange={(event) =>
                    onUpdate({ showInTable: event.target.checked })
                  }
                  disabled={!editable}
                />
              }
              label="Show in table"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.filterable ?? false}
                  onChange={(event) =>
                    onUpdate({ filterable: event.target.checked })
                  }
                  disabled={!editable}
                />
              }
              label="Filterable"
            />

            {isOptionsFieldType(field.type) ? (
              <TextField
                label="Options (value:label per line)"
                value={(field.options ?? [])
                  .map((option) => `${option.value}:${option.label}`)
                  .join('\n')}
                onChange={(event) => {
                  const options = event.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => {
                      const [value, ...labelParts] = line.split(':');
                      return {
                        value: value.trim(),
                        label: labelParts.join(':').trim() || value.trim(),
                      };
                    });
                  onUpdate({ options });
                }}
                fullWidth
                multiline
                minRows={4}
                disabled={
                  !editable && !(field.pipelineStage && mode === 'org')
                }
              />
            ) : null}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Section headers appear as titled groups in the form layout.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

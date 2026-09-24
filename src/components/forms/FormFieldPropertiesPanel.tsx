'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormFieldDisplayOptionsAsChipsToggle from '@/components/forms/FormFieldDisplayOptionsAsChipsToggle';
import FormFieldOptionsEditor from '@/components/forms/FormFieldOptionsEditor';
import FormFieldRowWidthSelector from '@/components/forms/FormFieldRowWidthSelector';
import FormFieldValidationFields from '@/components/forms/FormFieldValidationFields';
import { createEmptyFormFieldOption } from '@/lib/forms/form-field-options.utils';
import { resolveFormColSpan } from '@/lib/crm/fields/form-layout.utils';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import {
  canDeletePipelineStageOption,
  isPipelineStageOptionValueLocked,
} from '@/lib/crm/pipeline/stage-option-rules';
import {
  isFormFieldOptionColorsEditable,
  isFormFieldOptionsEditable,
  isFormFieldOptionsFullyEditable,
  isFormFieldPropertiesEditable,
  isPlatformLockedField,
} from '@/lib/forms/field-rules';
import { fieldSupportsFormStringValidation } from '@/lib/forms/field-string-validation.utils';
import { isProspectBantComputedField } from '@/lib/crm/prospects/prospect-bant-computed-fields.util';
import { formKeyToCustomFieldEntity } from '@/lib/forms/org-registry-forms';
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
  formKey: string;
  mode: FormEditorMode;
  fieldKeysInUse?: string[];
  onUpdate: (patch: Partial<FormFieldDefinition>) => void;
  readOnly?: boolean;
}

export default function FormFieldPropertiesPanel({
  field,
  formKey,
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
  const bantComputed = isProspectBantComputedField(field);
  const platformLocked = isPlatformLockedField(field, mode);
  const fieldTypes = mode === 'platform' ? PLATFORM_FIELD_TYPES : ORG_FIELD_TYPES;
  const keyInUse = fieldKeysInUse.includes(field.key);
  const isSection = isSectionFieldType(field.type);
  const defaultDisplayOptionsAsChips =
    formKeyToCustomFieldEntity(formKey) === 'prospect';
  const displayOptionsAsChips =
    field.displayOptionsAsChips ?? defaultDisplayOptionsAsChips;
  const fieldForOptionRules = { ...field, displayOptionsAsChips };
  const optionsEditable = isFormFieldOptionsEditable(fieldForOptionRules, mode);
  const optionsFullyEditable = isFormFieldOptionsFullyEditable(
    fieldForOptionRules,
    mode,
  );
  const optionColorsOnlyEditable = isFormFieldOptionColorsEditable(
    fieldForOptionRules,
    mode,
  );
  const pipelineStageOptionsEditor =
    mode === 'org' && field.pipelineStage === true;
  const pipelineValueLockedOptions = pipelineStageOptionsEditor
    ? new Set(
        (field.options ?? [])
          .filter((option) => isPipelineStageOptionValueLocked(option))
          .map((option) => option.value),
      )
    : undefined;

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

        {bantComputed ? (
          <Alert severity="info" className="rounded-xl">
            This value is calculated from BANT qualification and is read-only on
            live create and edit forms. Update it on the prospect BANT tab.
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
            {mode === 'platform' ? (
              <Typography variant="caption" color="text.secondary" className="block">
                Field key is generated automatically from the label when you save.
              </Typography>
            ) : (
              <TextField
                label="Key"
                value={field.key}
                onChange={(event) => onUpdate({ key: event.target.value })}
                fullWidth
                disabled={!editable || Boolean(field.system)}
              />
            )}

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

            <FormFieldRowWidthSelector
              colSpan={resolveFormColSpan(field)}
              onChange={(formColSpan) => onUpdate({ formColSpan })}
              disabled={!editable}
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

            {fieldSupportsFormStringValidation(field.type) ? (
              <Box>
                <Typography variant="subtitle2" className="mb-2">
                  Validation
                </Typography>
                <FormFieldValidationFields
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  validationType={field.validationType}
                  onMinLengthChange={(minLength) => onUpdate({ minLength })}
                  onMaxLengthChange={(maxLength) => onUpdate({ maxLength })}
                  onValidationTypeChange={(validationType) =>
                    onUpdate({ validationType })
                  }
                  disabled={!editable}
                />
              </Box>
            ) : null}

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
                  checked={
                    isSectionFieldType(field.type)
                      ? false
                      : (field.showInTable ?? true)
                  }
                  onChange={(event) =>
                    onUpdate({ showInTable: event.target.checked })
                  }
                  disabled={!editable || isSectionFieldType(field.type)}
                />
              }
              label="Show in table"
            />
            {formKeyToCustomFieldEntity(formKey) && !isSectionFieldType(field.type) ? (
              <FormHelperText className="mt-0 ml-8">
                Every field is available in the CRM list column picker for this
                org. Users choose which columns are visible from Customize
                columns on the list. Show in table is saved on the schema but
                does not remove the field from the picker.
              </FormHelperText>
            ) : null}

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
              <>
                <FormFieldDisplayOptionsAsChipsToggle
                  checked={displayOptionsAsChips}
                  onChange={(next) => onUpdate({ displayOptionsAsChips: next })}
                  disabled={!optionsFullyEditable}
                />
                <FormFieldOptionsEditor
                  options={
                    field.options?.length
                      ? field.options
                      : [createEmptyFormFieldOption()]
                  }
                  onChange={(options) => onUpdate({ options })}
                  disabled={!optionsEditable}
                  readOnlyLabels={
                    optionColorsOnlyEditable && !optionsFullyEditable
                  }
                  valueLockedOptions={pipelineValueLockedOptions}
                  canRemoveOption={
                    pipelineStageOptionsEditor
                      ? canDeletePipelineStageOption
                      : undefined
                  }
                  showChipPreview={displayOptionsAsChips}
                />
              </>
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

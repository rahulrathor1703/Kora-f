'use client';

import Typography from '@mui/material/Typography';
import { useState } from 'react';
import FormBuilderConditionsPlaceholder from '@/components/forms/FormBuilderConditionsPlaceholder';
import FormBuilderConfigDialog from '@/components/forms/FormBuilderConfigDialog';
import FormFieldDisplayOptionsAsChipsToggle from '@/components/forms/FormFieldDisplayOptionsAsChipsToggle';
import FormFieldOptionsEditor from '@/components/forms/FormFieldOptionsEditor';
import FormFieldPropertiesTabFields from '@/components/forms/FormFieldPropertiesTabFields';
import FormFieldValidationFields from '@/components/forms/FormFieldValidationFields';
import {
  areFormFieldOptionsValid,
  createEmptyFormFieldOption,
  normalizeFormFieldOptions,
} from '@/lib/forms/form-field-options.utils';
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
  isFormFieldUserLockable,
  isPlatformLockedField,
} from '@/lib/forms/field-rules';
import type { FormFieldValidationType } from '@/lib/forms/form-field-validation.types';
import { fieldSupportsFormStringValidation } from '@/lib/forms/field-string-validation.utils';
import type {
  FormEditorMode,
  FormFieldDefinition,
  FormFieldOption,
  FormFieldType,
} from '@/lib/forms/types';

function isOptionsFieldType(type: FormFieldType): boolean {
  return type === 'select' || type === 'multiselect';
}

interface FormEditFieldPropertiesDialogProps {
  open: boolean;
  field: FormFieldDefinition | null;
  mode: FormEditorMode;
  /** When `displayOptionsAsChips` is unset, default toggle for select fields. */
  defaultDisplayOptionsAsChips?: boolean;
  onClose: () => void;
  onSave: (patch: Partial<FormFieldDefinition>) => void;
}

function FormEditFieldPropertiesDialogForm({
  field,
  mode,
  defaultDisplayOptionsAsChips = false,
  onClose,
  onSave,
}: {
  field: FormFieldDefinition;
  mode: FormEditorMode;
  defaultDisplayOptionsAsChips?: boolean;
  onClose: () => void;
  onSave: (patch: Partial<FormFieldDefinition>) => void;
}) {
  const [label, setLabel] = useState(field.label);
  const [required, setRequired] = useState(field.required ?? false);
  const [formColSpan, setFormColSpan] = useState(resolveFormColSpan(field));
  const [minLength, setMinLength] = useState<number | undefined>(field.minLength);
  const [maxLength, setMaxLength] = useState<number | undefined>(field.maxLength);
  const [validationType, setValidationType] = useState<
    FormFieldValidationType | undefined
  >(field.validationType);
  const [layoutLocked, setLayoutLocked] = useState(field.layoutLocked ?? false);
  const [options, setOptions] = useState<FormFieldOption[]>(
    field.options?.length ? field.options : [createEmptyFormFieldOption()],
  );
  const [displayOptionsAsChips, setDisplayOptionsAsChips] = useState(
    field.displayOptionsAsChips ?? defaultDisplayOptionsAsChips,
  );

  const platformLocked = isPlatformLockedField(field, mode);
  const userLockable = isFormFieldUserLockable(field, mode);
  const editable = isFormFieldPropertiesEditable(
    { ...field, layoutLocked },
    mode,
  );
  const readOnly = !editable;
  const isOptionsField = isOptionsFieldType(field.type);
  const optionsEditable = isFormFieldOptionsEditable(
    { ...field, layoutLocked, displayOptionsAsChips },
    mode,
  );
  const optionsFullyEditable = isFormFieldOptionsFullyEditable(
    { ...field, layoutLocked, displayOptionsAsChips },
    mode,
  );
  const optionColorsOnlyEditable = isFormFieldOptionColorsEditable(
    { ...field, layoutLocked, displayOptionsAsChips },
    mode,
  );
  const pipelineStageOptionsEditor =
    mode === 'org' && field.pipelineStage === true;
  const pipelineValueLockedOptions = pipelineStageOptionsEditor
    ? new Set(
        options
          .filter((option) => isPipelineStageOptionValueLocked(option))
          .map((option) => option.value),
      )
    : undefined;

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }

    if (isOptionsField && !areFormFieldOptionsValid(options)) {
      return;
    }

    onSave({
      label: trimmedLabel,
      required,
      formColSpan,
      minLength,
      maxLength,
      validationType,
      ...(userLockable ? { layoutLocked } : {}),
      ...(isOptionsField
        ? {
            options: normalizeFormFieldOptions(options),
            displayOptionsAsChips,
          }
        : {}),
    });
    onClose();
  }

  const optionsValid = !isOptionsField || areFormFieldOptionsValid(options);

  return (
    <FormBuilderConfigDialog
      open
      kind="field"
      title="Field Properties"
      fieldLockHeader={
        platformLocked
          ? { kind: 'platform' }
          : userLockable
            ? {
                kind: 'toggle',
                locked: layoutLocked,
                onToggle: () => setLayoutLocked((value) => !value),
              }
            : undefined
      }
      confirmLabel="Save"
      confirmDisabled={
        !label.trim() ||
        !optionsValid ||
        (readOnly && !userLockable && !optionsEditable)
      }
      onClose={onClose}
      onConfirm={handleSave}
      propertiesContent={
        <FormFieldPropertiesTabFields
          label={label}
          onLabelChange={setLabel}
          required={required}
          onRequiredChange={setRequired}
          formColSpan={formColSpan}
          onFormColSpanChange={setFormColSpan}
          fieldTypeLabel={field.type}
          fieldKeyLabel={field.key}
          disabled={readOnly}
          extraContent={
            isOptionsField ? (
              <>
                <FormFieldDisplayOptionsAsChipsToggle
                  checked={displayOptionsAsChips}
                  onChange={setDisplayOptionsAsChips}
                  disabled={!optionsFullyEditable}
                />
                <FormFieldOptionsEditor
                  options={options}
                  onChange={setOptions}
                  disabled={!optionsEditable}
                  readOnlyLabels={optionColorsOnlyEditable && !optionsFullyEditable}
                  valueLockedOptions={pipelineValueLockedOptions}
                  canRemoveOption={
                    pipelineStageOptionsEditor
                      ? canDeletePipelineStageOption
                      : undefined
                  }
                  showChipPreview={displayOptionsAsChips}
                />
              </>
            ) : null
          }
        />
      }
      validationContent={
        fieldSupportsFormStringValidation(field.type) ? (
          <FormFieldValidationFields
            minLength={minLength}
            maxLength={maxLength}
            validationType={validationType}
            onMinLengthChange={setMinLength}
            onMaxLengthChange={setMaxLength}
            onValidationTypeChange={setValidationType}
            disabled={readOnly}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Validation rules apply to text, textarea, and phone fields only.
          </Typography>
        )
      }
      conditionsContent={<FormBuilderConditionsPlaceholder />}
    />
  );
}

export default function FormEditFieldPropertiesDialog({
  open,
  field,
  mode,
  defaultDisplayOptionsAsChips,
  onClose,
  onSave,
}: FormEditFieldPropertiesDialogProps) {
  if (!open || !field || isSectionFieldType(field.type)) {
    return null;
  }

  return (
    <FormEditFieldPropertiesDialogForm
      key={field.id}
      field={field}
      mode={mode}
      defaultDisplayOptionsAsChips={defaultDisplayOptionsAsChips}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

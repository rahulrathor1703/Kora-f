'use client';

import { useState } from 'react';
import LocationInputModeSelector from '@/components/crm/location/LocationInputModeSelector';
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
import type { FormFieldOption } from '@/lib/forms/types';
import type { CompanyFieldDefinition, CompanyFieldType } from '@/lib/crm/companies/types';
import { defaultFormColSpan } from '@/lib/crm/fields/form-layout.utils';
import {
  DEFAULT_LOCATION_COMPONENTS,
  normalizeLocationInputMode,
  type LocationInputMode,
} from '@/lib/crm/location/types';
import type { FormFieldValidationType } from '@/lib/forms/form-field-validation.types';
import type {
  ProspectFieldDefinition,
  ProspectFieldType,
} from '@/lib/crm/prospects/types';
import { slugifyLabel as slugifyCompanyLabel } from '@/lib/schemas/company-config-option';

export type CustomFieldEntity = 'company' | 'prospect';

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
  initialFieldType?: CompanyFieldType | ProspectFieldType;
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
  formColSpan: number,
  locationInputMode: LocationInputMode,
  minLength: number | undefined,
  maxLength: number | undefined,
  validationType: FormFieldValidationType | undefined,
  sectionId?: string,
  layoutLocked?: boolean,
  options?: FormFieldOption[],
  displayOptionsAsChips?: boolean,
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
    formColSpan,
    ...(minLength !== undefined ? { minLength } : {}),
    ...(maxLength !== undefined ? { maxLength } : {}),
    ...(validationType ? { validationType } : {}),
    ...(sectionId ? { sectionId } : {}),
    ...(layoutLocked ? { layoutLocked: true } : {}),
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
      options: normalizeFormFieldOptions(options),
      displayOptionsAsChips: displayOptionsAsChips ?? false,
    } as CustomFieldDefinition;
  }

  return {
    ...base,
    type,
    filterable: false,
  } as CustomFieldDefinition;
}

function AddCustomFieldDialogForm({
  entity,
  sortOrder,
  sectionId,
  initialFieldType,
  onClose,
  onConfirm,
}: Omit<AddCustomFieldDialogProps, 'open'>) {
  const fieldType = initialFieldType ?? 'text';
  const [label, setLabel] = useState('');
  const [required, setRequired] = useState(false);
  const [formColSpan, setFormColSpan] = useState(defaultFormColSpan(fieldType));
  const [minLength, setMinLength] = useState<number | undefined>();
  const [maxLength, setMaxLength] = useState<number | undefined>();
  const [validationType, setValidationType] = useState<
    FormFieldValidationType | undefined
  >();
  const [locationInputMode, setLocationInputMode] =
    useState<LocationInputMode>('api');
  const [layoutLocked, setLayoutLocked] = useState(false);
  const [options, setOptions] = useState<FormFieldOption[]>([
    createEmptyFormFieldOption(),
  ]);
  const [displayOptionsAsChips, setDisplayOptionsAsChips] = useState(
    entity === 'prospect',
  );

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
        fieldType,
        required,
        formColSpan,
        locationInputMode,
        minLength,
        maxLength,
        validationType,
        sectionId,
        layoutLocked,
        isOptionsFieldType(fieldType) ? options : undefined,
        isOptionsFieldType(fieldType) ? displayOptionsAsChips : undefined,
      ),
    );
  }

  const optionsValid =
    !isOptionsFieldType(fieldType) || areFormFieldOptionsValid(options);
  const canConfirm = label.trim().length > 0 && optionsValid;

  return (
    <FormBuilderConfigDialog
      open
      kind="field"
      title="Field Properties"
      fieldLockHeader={{
        kind: 'toggle',
        locked: layoutLocked,
        onToggle: () => setLayoutLocked((value) => !value),
      }}
      confirmLabel="Save"
      confirmDisabled={!canConfirm}
      onClose={onClose}
      onConfirm={handlePrimaryConfirm}
      propertiesContent={
        <FormFieldPropertiesTabFields
          label={label}
          onLabelChange={setLabel}
          required={required}
          onRequiredChange={setRequired}
          formColSpan={formColSpan}
          onFormColSpanChange={setFormColSpan}
          fieldTypeLabel={fieldType}
          autoFocusLabel
          extraContent={
            fieldType === 'location' ? (
              <LocationInputModeSelector
                value={locationInputMode}
                onChange={setLocationInputMode}
              />
            ) : isOptionsFieldType(fieldType) ? (
              <>
                <FormFieldDisplayOptionsAsChipsToggle
                  checked={displayOptionsAsChips}
                  onChange={setDisplayOptionsAsChips}
                />
                <FormFieldOptionsEditor
                  options={options}
                  onChange={setOptions}
                  showChipPreview={displayOptionsAsChips}
                />
              </>
            ) : null
          }
        />
      }
      validationContent={
        <FormFieldValidationFields
          minLength={minLength}
          maxLength={maxLength}
          validationType={validationType}
          onMinLengthChange={setMinLength}
          onMaxLengthChange={setMaxLength}
          onValidationTypeChange={setValidationType}
        />
      }
      conditionsContent={<FormBuilderConditionsPlaceholder />}
    />
  );
}

export default function AddCustomFieldDialog({
  open,
  entity,
  sortOrder,
  sectionId,
  initialFieldType,
  onClose,
  onConfirm,
}: AddCustomFieldDialogProps) {
  if (!open) {
    return null;
  }

  const sessionKey = `${initialFieldType ?? 'text'}-${sectionId ?? 'root'}`;

  return (
    <AddCustomFieldDialogForm
      key={sessionKey}
      entity={entity}
      sortOrder={sortOrder}
      sectionId={sectionId}
      initialFieldType={initialFieldType}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

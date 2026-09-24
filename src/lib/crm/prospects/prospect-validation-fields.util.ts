import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { filterFieldsForLayoutCanvas } from '@/lib/forms/layout-canvas-fields.utils';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { isProspectBantComputedField } from '@/lib/crm/prospects/prospect-bant-computed-fields.util';
import { filterProspectFieldsForLeadType } from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export type ProspectValidationFieldMode = 'liveCreate' | 'full';

/** Mirrors backend `filterProspectLiveCreateFields`. */
export function filterProspectLiveCreateFields(
  fields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  return fields.filter((field) => {
    if (isSectionFieldType(field.type)) {
      return false;
    }

    if (!field.sectionId) {
      return false;
    }

    if (field.system) {
      return false;
    }

    return field.showInForm !== false;
  });
}

export function filterProspectFullValidationFields(
  fields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  return fields.filter((field) => !isSectionFieldType(field.type));
}

export function getProspectValidationFields(
  fields: ProspectFieldDefinition[],
  values: Record<string, FieldStoredValue | undefined>,
  options: {
    mode: ProspectValidationFieldMode;
    formKey?: string;
    layoutFields?: ProspectFieldDefinition[];
  },
): ProspectFieldDefinition[] {
  const layoutFields = options.layoutFields ?? fields;
  const formKey = options.formKey ?? CRM_PROSPECT_CREATE_FORM_KEY;

  const modeFields =
    options.mode === 'liveCreate'
      ? filterProspectLiveCreateFields(
          filterFieldsForLayoutCanvas(formKey, fields) as ProspectFieldDefinition[],
        )
      : filterProspectFullValidationFields(fields);

  const leadTypeFiltered = filterProspectFieldsForLeadType(
    modeFields,
    values,
    layoutFields,
  );

  return leadTypeFiltered.filter((field) => !isProspectBantComputedField(field));
}

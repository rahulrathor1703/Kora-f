import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { getFieldsForLiveCreateForm } from '@/lib/forms/layout-canvas-fields.utils';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { filterProspectFieldsForLeadType } from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

/** Identity fields shown in the page header / create form, not the summary strip. */
const PROSPECT_OVERVIEW_SUMMARY_EXCLUDED_KEYS = new Set(['fullName', 'email']);

/** Legacy duplicate or merged into the Lead Score display (with BANT tier). */
const PROSPECT_OVERVIEW_SUMMARY_SUPPRESSED_KEYS = new Set([
  'bantTier',
  'leadScore',
]);

/** Not shown on prospect detail overview. */
const PROSPECT_OVERVIEW_HIDDEN_KEYS = new Set(['emailStatus']);

/** Shown below the create-form layout (not in the top metrics strip). */
const PROSPECT_OVERVIEW_FOOTER_FIELD_KEYS = new Set(['score']);

/**
 * Synced or internal metrics — read-only on overview even when present on the schema.
 * Pipeline stage (`crmStatus`) is editable via `editableOnDetail`.
 */
export const PROSPECT_DETAIL_READ_ONLY_FIELD_KEYS = new Set([
  'emailStatus',
  'score',
  'bantTier',
  'leadId',
  'createdBy',
  'createdDate',
  'modifiedDate',
  'leadScore',
  'utmSource',
  'utmCampaign',
  'convertedAccount',
  'convertedOpportunity',
]);

export function getProspectOverviewLayoutFields(
  fields: ProspectFieldDefinition[],
  values: Record<string, FieldStoredValue | undefined>,
): ProspectFieldDefinition[] {
  const createFormLayout = getFieldsForLiveCreateForm(
    CRM_PROSPECT_CREATE_FORM_KEY,
    fields,
  ) as ProspectFieldDefinition[];

  return filterProspectFieldsForLeadType(createFormLayout, values, fields).filter(
    (field) => field.key !== 'leadScore',
  );
}

/** @deprecated Top metrics strip removed from prospect detail; use footer fields. */
export function getProspectOverviewSummaryFields(
  _fields: ProspectFieldDefinition[],
  layoutFields: ProspectFieldDefinition[] = [],
): ProspectFieldDefinition[] {
  void _fields;
  void layoutFields;
  return [];
}

export function getProspectOverviewFooterFields(
  fields: ProspectFieldDefinition[],
  layoutFields: ProspectFieldDefinition[] = [],
): ProspectFieldDefinition[] {
  const layoutDataKeys = new Set(
    getProspectOverviewDataFields(layoutFields).map((field) => field.key),
  );

  return [...fields]
    .filter((field) => {
      if (isSectionFieldType(field.type)) {
        return false;
      }

      if (field.system) {
        return false;
      }

      if (PROSPECT_OVERVIEW_HIDDEN_KEYS.has(field.key)) {
        return false;
      }

      if (PROSPECT_OVERVIEW_SUMMARY_EXCLUDED_KEYS.has(field.key)) {
        return false;
      }

      if (PROSPECT_OVERVIEW_SUMMARY_SUPPRESSED_KEYS.has(field.key)) {
        return false;
      }

      if (!PROSPECT_OVERVIEW_FOOTER_FIELD_KEYS.has(field.key)) {
        return false;
      }

      if (layoutDataKeys.has(field.key)) {
        return false;
      }

      return field.showInTable === true;
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function isProspectFieldEditableOnDetail(
  field: ProspectFieldDefinition,
): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  if (field.system) {
    return false;
  }

  if (PROSPECT_DETAIL_READ_ONLY_FIELD_KEYS.has(field.key)) {
    return false;
  }

  if (field.editableOnDetail === true) {
    return true;
  }

  if (field.editableOnDetail === false) {
    return false;
  }

  return Boolean(field.sectionId) && field.showInForm !== false;
}

export function getProspectOverviewDataFields(
  layoutFields: ProspectFieldDefinition[],
): ProspectFieldDefinition[] {
  return layoutFields.filter((field) => !isSectionFieldType(field.type));
}

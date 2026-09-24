import {
  CRM_COMPANY_CREATE_FORM_KEY,
  CRM_PROSPECT_CREATE_FORM_KEY,
  isManageableFormKey,
  MANAGEABLE_FORM_KEYS,
} from '@/lib/forms/crm-form-keys';
import type { FormRegistryListItem } from '@/lib/forms/types';

function manageableFormOrderIndex(formKey: string): number {
  const index = MANAGEABLE_FORM_KEYS.indexOf(formKey as (typeof MANAGEABLE_FORM_KEYS)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function filterManageableForms(
  forms: FormRegistryListItem[],
): FormRegistryListItem[] {
  return forms.filter(
    (form) =>
      isManageableFormKey(form.key) &&
      form.supportsOrgExtensions &&
      !form.hideFromOrgRegistry,
  );
}

export function sortManageableForms(
  forms: FormRegistryListItem[],
): FormRegistryListItem[] {
  const filtered = filterManageableForms(forms);

  return [...filtered].sort(
    (left, right) =>
      manageableFormOrderIndex(left.key) - manageableFormOrderIndex(right.key),
  );
}

export function getDefaultOrgFormKey(forms: FormRegistryListItem[]): string {
  const sorted = sortManageableForms(forms);
  return sorted[0]?.key ?? CRM_PROSPECT_CREATE_FORM_KEY;
}

export type CustomFieldEntity = 'prospect' | 'company';

export function formKeyToCustomFieldEntity(
  formKey: string,
): CustomFieldEntity | null {
  if (
    formKey === CRM_PROSPECT_CREATE_FORM_KEY ||
    formKey.startsWith('crm.prospect.')
  ) {
    return 'prospect';
  }

  if (
    formKey === CRM_COMPANY_CREATE_FORM_KEY ||
    formKey.startsWith('crm.company.')
  ) {
    return 'company';
  }

  return null;
}

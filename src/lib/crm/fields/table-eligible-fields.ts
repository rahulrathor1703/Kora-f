import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';

export interface CrmTableFieldLike {
  key: string;
  type: string;
  showInForm?: boolean;
  showInTable?: boolean;
  source?: 'platform' | 'org';
}

/** @deprecated Use getCrmListTableColumnFields for CRM prospect/company lists. */
export function getCrmListTableEligibleFields<T extends CrmTableFieldLike>(
  fields: T[],
): T[] {
  return fields.filter(
    (field) =>
      !isSectionFieldType(field.type) && field.showInTable === true,
  );
}

/** @deprecated Use getCrmListTableDefaultColumnVisible for CRM prospect/company lists. */
export function getCrmListTableDefaultVisible(field: CrmTableFieldLike): boolean {
  return field.showInTable === true;
}

/** All non-section schema fields available as CRM list columns (visibility via column settings). */
export function getCrmListTableColumnFields<T extends CrmTableFieldLike>(
  fields: T[],
): T[] {
  return fields.filter((field) => !isSectionFieldType(field.type));
}

/** Default visible when the user has no saved column preferences. */
export function getCrmListTableDefaultColumnVisible(
  field: CrmTableFieldLike,
): boolean {
  void field;
  return true;
}

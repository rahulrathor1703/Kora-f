import type { FormFieldDefinition } from '@/lib/forms/types';
export {
  getFormLayoutGroupKey,
  moveFieldToLayoutGroup,
  reorderFormLayoutGroup,
  updateFieldFormColSpan,
} from '@/lib/crm/fields/form-layout-preview.utils';

export type { FormLayoutField } from '@/lib/crm/fields/form-layout.utils';

export function asFormLayoutFields(
  fields: FormFieldDefinition[],
): FormFieldDefinition[] {
  return fields;
}

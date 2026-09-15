import type { ContactListFieldMapping } from '@/lib/email/lists/types';
import { buildFieldMappingFromTableColumnMappings } from '@/lib/email/lists/list-column-mapping-utils';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import type { ListImportWizardFormValues } from '@/lib/schemas/contact-list-import';

export function buildContactListFieldMappingPayload(
  values: ListImportWizardFormValues,
  tableColumns: FormTableColumnDefinition[],
): ContactListFieldMapping {
  return buildFieldMappingFromTableColumnMappings(
    tableColumns,
    values.columnMappings,
  );
}

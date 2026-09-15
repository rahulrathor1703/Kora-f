import { z } from 'zod';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import {
  createListColumnMappingsSchema,
  schemaColumnMappingRowSchema,
  type SchemaColumnMappingRowFormValues,
} from '@/lib/schemas/list-column-mapping';

export const listImportStep1Schema = z.object({
  name: z.string().trim().min(1, 'List name is required').max(255),
});

export function createListImportWizardSchema(
  tableColumns: FormTableColumnDefinition[],
) {
  return listImportStep1Schema.extend({
    columnMappings: createListColumnMappingsSchema(tableColumns),
  });
}

export type ListImportWizardFormValues = z.infer<
  ReturnType<typeof createListImportWizardSchema>
>;

export const LIST_IMPORT_WIZARD_DEFAULT_VALUES: ListImportWizardFormValues = {
  name: '',
  columnMappings: [],
};

export const LIST_IMPORT_WIZARD_STEPS = [
  { id: 'upload', label: 'Upload file' },
  { id: 'mapping', label: 'Match columns' },
  { id: 'review', label: 'Review & import' },
] as const;

export type ListImportWizardStepId =
  (typeof LIST_IMPORT_WIZARD_STEPS)[number]['id'];

export type { SchemaColumnMappingRowFormValues };
export { schemaColumnMappingRowSchema };

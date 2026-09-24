import { z } from 'zod';
import type { FormTableColumnDefinition } from '@/lib/forms/types';

export const schemaColumnMappingRowSchema = z.object({
  targetColumnKey: z.string().trim().min(1),
  sourceColumn: z.string(),
});

export type SchemaColumnMappingRowFormValues = z.infer<
  typeof schemaColumnMappingRowSchema
>;

export function createListColumnMappingsSchema(
  tableColumns: FormTableColumnDefinition[],
) {
  const requiredKeys = new Set(
    tableColumns.filter((column) => column.required).map((column) => column.key),
  );

  return z
    .array(schemaColumnMappingRowSchema)
    .min(1, 'At least one column mapping is required')
    .superRefine((mappings, context) => {
      const usedSourceColumns = new Set<string>();

      mappings.forEach((mapping, index) => {
        const sourceColumn = mapping.sourceColumn.trim();
        const isRequired = requiredKeys.has(mapping.targetColumnKey);

        if (isRequired && !sourceColumn) {
          const columnLabel =
            tableColumns.find((column) => column.key === mapping.targetColumnKey)
              ?.label ?? mapping.targetColumnKey;

          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${columnLabel} must be mapped to a file column`,
            path: [index, 'sourceColumn'],
          });
        }

        if (sourceColumn) {
          if (usedSourceColumns.has(sourceColumn)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Each file column can only be mapped once',
              path: [index, 'sourceColumn'],
            });
          }

          usedSourceColumns.add(sourceColumn);
        }
      });

      for (const requiredKey of requiredKeys) {
        const mapping = mappings.find((item) => item.targetColumnKey === requiredKey);
        if (!mapping?.sourceColumn.trim()) {
          const columnLabel =
            tableColumns.find((column) => column.key === requiredKey)?.label ??
            requiredKey;

          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${columnLabel} is required`,
            path: [0, 'sourceColumn'],
          });
        }
      }
    });
}

export interface ListColumnMappingTarget {
  key: string;
  label: string;
  required?: boolean;
  type?: string;
}

export function toListColumnMappingTargets(
  tableColumns: FormTableColumnDefinition[],
): ListColumnMappingTarget[] {
  return tableColumns.map((column) => ({
    key: column.key,
    label: column.label,
    required: column.required,
    type: column.type,
  }));
}
